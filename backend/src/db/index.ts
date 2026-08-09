import * as fs from "fs";
import * as path from "path";
import initSqlJs from "sql.js";
import { Agent, Post, TopicReview, RunLog, PersonaProfile } from "../types";

export function normalizePersona(persona: any): PersonaProfile {
  const domain = persona?.domain || "General";
  const name = persona?.name || "Agent";
  const interests = Array.isArray(persona?.interests) && persona.interests.length > 0
    ? persona.interests
    : [domain];
  const opinions = Array.isArray(persona?.opinions) ? persona.opinions : [];
  const publishingStandards = Array.isArray(persona?.publishingStandards) ? persona.publishingStandards : [];
  const voice = {
    tone: persona?.voice?.tone || "direct and analytical",
    sentenceStyle: persona?.voice?.sentenceStyle || "clear declarative sentences",
    personPOV: (persona?.voice?.personPOV === "first" ? "first" : "third") as "first" | "third",
    signaturePhrases: Array.isArray(persona?.voice?.signaturePhrases) ? persona.voice.signaturePhrases : [],
  };
  const bio = persona?.bio || `${name} is an expert in ${domain}.`;

  return {
    name,
    domain,
    bio,
    voice,
    interests,
    opinions,
    publishingStandards,
  };
}

let SQL: any;
let db: any;
let dbPath: string;
let dbReady = false;
let initPromise: Promise<void> | null = null;

export function isDbReady(): boolean {
  return dbReady;
}

export function ensureDbInitialized(dataPath?: string): Promise<void> {
  if (dbReady) {
    return Promise.resolve();
  }
  if (!initPromise) {
    const targetPath = dataPath || process.env.DATABASE_PATH || (process.env.VERCEL ? "/tmp/agent.db" : "./agent.db");
    initPromise = initDb(targetPath);
  }
  return initPromise;
}

export async function initDb(dataPath: string) {
  SQL = await initSqlJs();
  dbPath = dataPath;

  // Load or create database
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    createSchema();
    saveDb();
  }

  dbReady = true;
}

function ensureReady() {
  if (!dbReady) {
    throw new Error("Database not initialized. Call initDb first.");
  }
}

function createSchema() {
  db.run(`
    CREATE TABLE IF NOT EXISTS agents (
      agent_id TEXT PRIMARY KEY,
      persona_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      next_run_at TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      text TEXT NOT NULL,
      rationale TEXT NOT NULL,
      sources_json TEXT NOT NULL,
      topic_key TEXT NOT NULL,
      embedding_json TEXT,
      FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS topic_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL,
      candidate_title TEXT,
      candidate_url TEXT,
      verdict TEXT NOT NULL,
      reason TEXT,
      novelty_score REAL,
      relevance_score REAL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS run_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      started_at TEXT NOT NULL,
      finished_at TEXT,
      outcome TEXT,
      detail TEXT
    )
  `);

  saveDb();
}

function saveDb() {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error("Error saving database file:", err);
  }
}

export function saveAgent(agent: Agent) {
  ensureReady();
  const normalizedPersona = normalizePersona(agent.persona);
  db.run(
    `INSERT OR REPLACE INTO agents (agent_id, persona_json, status, created_at, next_run_at)
     VALUES (?, ?, ?, ?, ?)`,
    [agent.agentId, JSON.stringify(normalizedPersona), agent.status, agent.createdAt, agent.nextRunAt || null]
  );
  saveDb();
}

export function getAgent(agentId: string): Agent | null {
  ensureReady();
  const stmt = db.prepare(
    `SELECT agent_id, persona_json, status, created_at, next_run_at FROM agents WHERE agent_id = ?`
  );
  stmt.bind([agentId]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    if (!row.persona_json) {
      throw new Error(`Agent ${agentId} has empty persona_json`);
    }
    return {
      agentId: row.agent_id,
      persona: normalizePersona(JSON.parse(row.persona_json)),
      status: row.status,
      createdAt: row.created_at,
      nextRunAt: row.next_run_at,
    };
  }
  stmt.free();
  return null;
}

export function getAllAgents(): Agent[] {
  ensureReady();
  const stmt = db.prepare(
    `SELECT agent_id, persona_json, status, created_at, next_run_at FROM agents ORDER BY created_at DESC`
  );
  const agents: Agent[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    agents.push({
      agentId: row.agent_id,
      persona: normalizePersona(JSON.parse(row.persona_json)),
      status: row.status,
      createdAt: row.created_at,
      nextRunAt: row.next_run_at,
    });
  }
  stmt.free();
  return agents;
}

export function getAllActiveAgents(): Agent[] {
  ensureReady();
  const stmt = db.prepare(
    `SELECT agent_id, persona_json, status, created_at, next_run_at FROM agents WHERE status = 'active'`
  );
  const agents: Agent[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    agents.push({
      agentId: row.agent_id,
      persona: normalizePersona(JSON.parse(row.persona_json)),
      status: row.status,
      createdAt: row.created_at,
      nextRunAt: row.next_run_at,
    });
  }
  stmt.free();
  return agents;
}

export function savePost(post: Post) {
  ensureReady();
  db.run(
    `INSERT INTO posts (id, agent_id, created_at, text, rationale, sources_json, topic_key)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [post.id, post.agentId, post.createdAt, post.text, post.rationale, JSON.stringify(post.sources), post.topicKey]
  );
  saveDb();
}

export function getPosts(agentId: string): Post[] {
  ensureReady();
  const stmt = db.prepare(
    `SELECT id, agent_id, created_at, text, rationale, sources_json, topic_key FROM posts WHERE agent_id = ? ORDER BY created_at DESC`
  );
  stmt.bind([agentId]);
  const posts: Post[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    posts.push({
      id: row.id,
      agentId: row.agent_id,
      createdAt: row.created_at,
      text: row.text,
      rationale: row.rationale,
      sources: JSON.parse(row.sources_json),
      topicKey: row.topic_key,
    });
  }
  stmt.free();
  return posts;
}

export function getAllPosts(limit: number = 100): Post[] {
  ensureReady();
  const stmt = db.prepare(
    `SELECT id, agent_id, created_at, text, rationale, sources_json, topic_key FROM posts ORDER BY created_at DESC LIMIT ?`
  );
  stmt.bind([limit]);
  const posts: Post[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    posts.push({
      id: row.id,
      agentId: row.agent_id,
      createdAt: row.created_at,
      text: row.text,
      rationale: row.rationale,
      sources: JSON.parse(row.sources_json),
      topicKey: row.topic_key,
    });
  }
  stmt.free();
  return posts;
}

export function getRecentPosts(agentId: string, limit: number): Post[] {
  ensureReady();
  const stmt = db.prepare(
    `SELECT id, agent_id, created_at, text, rationale, sources_json, topic_key FROM posts WHERE agent_id = ? ORDER BY created_at DESC LIMIT ?`
  );
  stmt.bind([agentId, limit]);
  const posts: Post[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    posts.push({
      id: row.id,
      agentId: row.agent_id,
      createdAt: row.created_at,
      text: row.text,
      rationale: row.rationale,
      sources: JSON.parse(row.sources_json),
      topicKey: row.topic_key,
    });
  }
  stmt.free();
  return posts;
}

export function saveTopicReview(review: TopicReview) {
  ensureReady();
  db.run(
    `INSERT INTO topic_reviews (agent_id, reviewed_at, candidate_title, candidate_url, verdict, reason, novelty_score, relevance_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      review.agentId,
      review.reviewedAt,
      review.candidateTitle || null,
      review.candidateUrl || null,
      review.verdict,
      review.reason || null,
      review.noveltyScore || null,
      review.relevanceScore || null,
    ]
  );
  saveDb();
}

export function getTopicReviews(agentId?: string, limit: number = 50): TopicReview[] {
  ensureReady();
  let query = `SELECT agent_id, reviewed_at, candidate_title, candidate_url, verdict, reason, novelty_score, relevance_score FROM topic_reviews`;
  const params: any[] = [];
  if (agentId) {
    query += ` WHERE agent_id = ?`;
    params.push(agentId);
  }
  query += ` ORDER BY id DESC LIMIT ?`;
  params.push(limit);

  const stmt = db.prepare(query);
  stmt.bind(params);
  const reviews: TopicReview[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    reviews.push({
      agentId: row.agent_id,
      reviewedAt: row.reviewed_at,
      candidateTitle: row.candidate_title,
      candidateUrl: row.candidate_url,
      verdict: row.verdict,
      reason: row.reason,
      noveltyScore: row.novelty_score,
      relevanceScore: row.relevance_score,
    });
  }
  stmt.free();
  return reviews;
}

export function saveRunLog(log: RunLog) {
  ensureReady();
  db.run(
    `INSERT INTO run_log (agent_id, started_at, finished_at, outcome, detail)
     VALUES (?, ?, ?, ?, ?)`,
    [log.agentId, log.startedAt, log.finishedAt || null, log.outcome, log.detail || null]
  );
  saveDb();
}

export function getRunLogs(agentId?: string, limit: number = 50): RunLog[] {
  ensureReady();
  let query = `SELECT id, agent_id, started_at, finished_at, outcome, detail FROM run_log`;
  const params: any[] = [];
  if (agentId) {
    query += ` WHERE agent_id = ?`;
    params.push(agentId);
  }
  query += ` ORDER BY id DESC LIMIT ?`;
  params.push(limit);

  const stmt = db.prepare(query);
  stmt.bind(params);
  const logs: RunLog[] = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    logs.push({
      id: row.id,
      agentId: row.agent_id,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      outcome: row.outcome,
      detail: row.detail,
    });
  }
  stmt.free();
  return logs;
}

export function getSystemStats() {
  ensureReady();
  const agentsCount = (db.exec(`SELECT COUNT(*) FROM agents`)[0]?.values[0][0] || 0) as number;
  const activeAgentsCount = (db.exec(`SELECT COUNT(*) FROM agents WHERE status = 'active'`)[0]?.values[0][0] || 0) as number;
  const postsCount = (db.exec(`SELECT COUNT(*) FROM posts`)[0]?.values[0][0] || 0) as number;
  const totalReviews = (db.exec(`SELECT COUNT(*) FROM topic_reviews`)[0]?.values[0][0] || 0) as number;
  const acceptCount = (db.exec(`SELECT COUNT(*) FROM topic_reviews WHERE verdict = 'accept'`)[0]?.values[0][0] || 0) as number;
  const rejectCount = (db.exec(`SELECT COUNT(*) FROM topic_reviews WHERE verdict = 'reject'`)[0]?.values[0][0] || 0) as number;

  const acceptanceRate = totalReviews > 0 ? ((acceptCount / totalReviews) * 100).toFixed(1) + "%" : "0%";

  return {
    agentsCount,
    activeAgentsCount,
    postsCount,
    totalReviews,
    acceptCount,
    rejectCount,
    acceptanceRate,
  };
}

export const getStats = getSystemStats;

export function getTopicKey(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
}

export function topicExists(agentId: string, topicKey: string): boolean {
  ensureReady();
  const stmt = db.prepare(`SELECT id FROM posts WHERE agent_id = ? AND topic_key = ?`);
  stmt.bind([agentId, topicKey]);
  const exists = stmt.step();
  stmt.free();
  return exists;
}

export function clearAllData() {
  ensureReady();
  db.run(`DELETE FROM posts`);
  db.run(`DELETE FROM topic_reviews`);
  db.run(`DELETE FROM run_log`);
  db.run(`DELETE FROM agents`);
  saveDb();
}
