import { v4 as uuid } from "uuid";
import * as db from "../db";
import * as anthropic from "./llm";
import { Agent, Post, RunLog } from "../types";

const schedulers = new Map<string, NodeJS.Timeout>();
let cycleCounter = new Map<string, number>();

const MIN_MS = (parseInt(process.env.MIN_CYCLE_MINUTES || "90", 10) * 60) / (process.env.DEV_FAST_CYCLE ? 60 : 1) * 1000;
const MAX_MS = (parseInt(process.env.MAX_CYCLE_MINUTES || "240", 10) * 60) / (process.env.DEV_FAST_CYCLE ? 60 : 1) * 1000;

console.log(`Cycle interval: ${MIN_MS / 1000}s - ${MAX_MS / 1000}s`);

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function runCycle(agentId: string) {
  const agent = db.getAgent(agentId);
  if (!agent) {
    console.log(`Agent ${agentId} not found, stopping scheduler`);
    stopScheduler(agentId);
    return;
  }

  const cycleNum = (cycleCounter.get(agentId) || 0) + 1;
  cycleCounter.set(agentId, cycleNum);

  const startedAt = new Date().toISOString();
  console.log(`[${agentId}] Cycle #${cycleNum} started at ${startedAt}`);

  const runLog: RunLog = {
    agentId,
    startedAt,
    outcome: "error",
    detail: "Unknown error",
  };

  try {
    // 1. Discovery
    const persona = db.normalizePersona(agent.persona);
    const interests = persona.interests.length > 0 ? persona.interests : [persona.domain || "General"];
    const interestIndex = (cycleNum + Math.floor(Date.now() / 10000)) % interests.length;
    console.log(`[${agentId}] Discovering topics (interest: ${interests[interestIndex]})`);
    const candidates = await anthropic.discoverTopics(persona, interestIndex);

    if (!Array.isArray(candidates) || !candidates.length) {
      console.log(`[${agentId}] No candidates found`);
      runLog.outcome = "skipped_no_candidates";
      runLog.finishedAt = new Date().toISOString();
      await db.saveRunLog(runLog);
      reschedule(agentId);
      return;
    }

    console.log(`[${agentId}] Found ${candidates.length} candidates`);

    // 2. Get memory & pre-filter already published candidates
    const recentPosts = db.getRecentPosts(agentId, 50);
    const recentTopics = (Array.isArray(recentPosts) ? recentPosts : []).map((p) => p.topicKey);

    // Filter out candidates that already exist in SQLite vector/topic memory
    const freshCandidates = candidates.filter((c) => {
      const k = db.getTopicKey(c.title);
      return !db.topicExists(agentId, k);
    });

    const candidatesToEvaluate = freshCandidates.length > 0 ? freshCandidates : candidates;
    console.log(`[${agentId}] Evaluating ${candidatesToEvaluate.length} fresh unvisited candidates`);

    // 3. Editorial judgment
    console.log(`[${agentId}] Judging topics`);
    const review = await anthropic.judgeTopics(persona, candidatesToEvaluate, recentTopics);

    // Save all reviews
    for (const judgment of (review?.all || [])) {
      if (judgment && judgment.candidate) {
        await db.saveTopicReview({
          agentId,
          reviewedAt: new Date().toISOString(),
          candidateTitle: judgment.candidate.title,
          candidateUrl: judgment.candidate.url,
          verdict: judgment.verdict,
          reason: judgment.reason,
          noveltyScore: judgment.noveltyScore,
          relevanceScore: judgment.relevanceScore,
        });
      }
    }

    if (!review.accepted) {
      console.log(`[${agentId}] All topics rejected`);
      runLog.outcome = "skipped_all_rejected";
      runLog.finishedAt = new Date().toISOString();
      await db.saveRunLog(runLog);
      reschedule(agentId);
      return;
    }

    // Hard dedup check across candidate list
    let acceptedCandidate = review.accepted;
    let topicKey = db.getTopicKey(acceptedCandidate.title);

    if (db.topicExists(agentId, topicKey)) {
      console.log(`[${agentId}] Topic key "${topicKey}" already exists in memory. Checking remaining candidates...`);
      const unvisited = (review.all || []).find((j) => j.verdict === 'accept' && !db.topicExists(agentId, db.getTopicKey(j.candidate.title)));
      if (unvisited && unvisited.candidate) {
        acceptedCandidate = {
          ...unvisited.candidate,
          verdict: 'accept',
          reason: unvisited.reason,
          noveltyScore: unvisited.noveltyScore,
          relevanceScore: unvisited.relevanceScore,
        };
        topicKey = db.getTopicKey(acceptedCandidate.title);
        console.log(`[${agentId}] Selected next unvisited candidate topic: "${acceptedCandidate.title}"`);
      } else {
        console.log(`[${agentId}] All candidate topics already exist in memory (duplicate detected)`);
        runLog.outcome = "skipped_dedup";
        runLog.detail = `Exact match on topic_key: ${topicKey}`;
        runLog.finishedAt = new Date().toISOString();
        await db.saveRunLog(runLog);
        reschedule(agentId);
        return;
      }
    }

    // 4. Write post
    console.log(`[${agentId}] Writing post: "${acceptedCandidate.title}"`);
    const draft = await anthropic.writePost(persona, acceptedCandidate, recentTopics);

    // Near-duplicate check (simple token overlap)
    const existingTexts = recentPosts.map((p) => p.text);
    if (isNearDuplicate(draft.text, existingTexts)) {
      console.log(`[${agentId}] Draft is near-duplicate of existing post`);
      runLog.outcome = "skipped_near_duplicate";
      runLog.finishedAt = new Date().toISOString();
      await db.saveRunLog(runLog);
      reschedule(agentId);
      return;
    }

    // 5. Save post
    const post: Post = {
      id: uuid(),
      agentId,
      createdAt: new Date().toISOString(),
      text: draft.text,
      rationale: draft.rationale,
      sources: draft.sources,
      topicKey,
    };

    await db.savePost(post);
    console.log(`[${agentId}] Published post: ${post.id}`);

    runLog.outcome = "published";
    runLog.finishedAt = new Date().toISOString();
  } catch (error) {
    console.error(`[${agentId}] Error during cycle:`, error);
    runLog.outcome = "error";
    runLog.detail = error instanceof Error ? error.message : String(error);
    runLog.finishedAt = new Date().toISOString();
  } finally {
    await db.saveRunLog(runLog);
    reschedule(agentId);
  }
}

function isNearDuplicate(text: string, existing: string[]): boolean {
  if (!text || !Array.isArray(existing)) return false;
  const words = new Set(text.toLowerCase().split(/\s+/));
  for (const otherText of existing) {
    if (!otherText) continue;
    const otherWords = new Set(otherText.toLowerCase().split(/\s+/));
    let overlap = 0;
    for (const word of words) {
      if (otherWords.has(word)) overlap++;
    }
    const similarity = overlap / Math.max(words.size, otherWords.size);
    if (similarity > 0.6) return true;
  }
  return false;
}

function reschedule(agentId: string) {
  const delay = randomBetween(MIN_MS, MAX_MS);
  const nextRun = new Date(Date.now() + delay).toISOString();

  const agent = db.getAgent(agentId);
  if (agent) {
    agent.nextRunAt = nextRun;
    db.saveAgent(agent);
  }

  console.log(`[${agentId}] Scheduled next cycle for ${nextRun} (in ${delay / 1000}s)`);

  if (schedulers.has(agentId)) {
    clearTimeout(schedulers.get(agentId));
  }

  const timeout = setTimeout(() => {
    runCycle(agentId);
  }, delay);

  schedulers.set(agentId, timeout);
}

export function startScheduler(agentId: string) {
  console.log(`Starting scheduler for ${agentId}`);
  runCycle(agentId);
}

export function stopScheduler(agentId?: string) {
  if (agentId) {
    const timeout = schedulers.get(agentId);
    if (timeout) {
      clearTimeout(timeout);
      schedulers.delete(agentId);
    }
  } else {
    schedulers.forEach((timeout) => clearTimeout(timeout));
    schedulers.clear();
  }
}

export async function resumeActiveAgents() {
  const agents = db.getAllActiveAgents();
  console.log(`Resuming ${agents.length} active agents`);

  agents.forEach((agent, index) => {
    const nextRunAt = agent.nextRunAt ? new Date(agent.nextRunAt).getTime() : Date.now();
    const now = Date.now();
    // Stagger initial execution by 6 seconds per agent to prevent API rate limit bursts
    const staggerMs = index * 6000;
    const baseDelay = Math.max(0, nextRunAt - now);
    const delay = baseDelay === 0 ? staggerMs : baseDelay;

    console.log(
      `[${agent.agentId}] Resuming scheduler (next run in ${(delay / 1000).toFixed(1)}s)`
    );

    const timeout = setTimeout(() => {
      runCycle(agent.agentId);
    }, delay);
    schedulers.set(agent.agentId, timeout);
  });
}
