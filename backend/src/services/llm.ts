import Groq from "groq-sdk";
import {
  PersonaProfile,
  DiscoveryCandidates,
  JudgmentResult,
  JudgmentReview,
  DraftPost,
} from "../types";
import { normalizePersona } from "../db";
import { fetchLiveNewsCandidates } from "./fetcher";

let _client: Groq | null = null;
function getClient(): Groq {
  if (!_client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("GROQ_API_KEY is not set in environment variables");
    }
    _client = new Groq({ apiKey: apiKey || "missing-key" });
  }
  return _client;
}

// Fallback Model Pool for Groq Rate Limit (429 TPD / TPM) Mitigation
const FALLBACK_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama3-70b-8192",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
];

async function callLLMWithRetry(params: any, retries: number = 3): Promise<any> {
  let lastErr: any = null;

  for (const modelCandidate of FALLBACK_MODELS) {
    const currentParams = { ...params, model: modelCandidate };
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await getClient().chat.completions.create(currentParams);
        return response;
      } catch (err: any) {
        lastErr = err;
        const isRateLimit =
          err?.status === 429 ||
          err?.error?.error?.code === "rate_limit_exceeded" ||
          String(err?.message || "").includes("Rate limit");

        if (isRateLimit) {
          console.warn(`[Groq RateLimit 429 on ${modelCandidate}] Switching to next fallback model...`);
          break; // Try next fallback model
        }

        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          break;
        }
      }
    }
  }

  throw lastErr;
}

function extractJSON(content: string, preferArray: boolean = false): string {
  const trimmed = content.trim();
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const text = codeBlockMatch ? codeBlockMatch[1].trim() : trimmed;

  const firstObj = text.indexOf('{');
  const firstArr = text.indexOf('[');

  let start = -1;
  let isArray = false;

  if (preferArray) {
    if (firstArr !== -1 && (firstObj === -1 || firstArr < firstObj)) {
      start = firstArr;
      isArray = true;
    } else if (firstArr !== -1) {
      start = firstArr;
      isArray = true;
    } else {
      start = firstObj;
      isArray = false;
    }
  } else {
    if (firstObj !== -1 && (firstArr === -1 || firstObj < firstArr)) {
      start = firstObj;
      isArray = false;
    } else if (firstObj !== -1) {
      start = firstObj;
      isArray = false;
    } else {
      start = firstArr;
      isArray = true;
    }
  }

  if (start === -1) {
    throw new Error(`No JSON object or array found in LLM response text:\n${content}`);
  }

  const endChar = isArray ? ']' : '}';
  const lastEnd = text.lastIndexOf(endChar);

  if (lastEnd === -1 || lastEnd < start) {
    throw new Error(`Incomplete JSON structural delimiters in LLM response text:\n${content}`);
  }

  let jsonSub = text.substring(start, lastEnd + 1);
  // Sanitize invalid control characters in raw LLM JSON output (e.g. unescaped newlines inside strings)
  jsonSub = jsonSub.replace(/[\u0000-\u001F]+/g, (match) => {
    if (match === "\n" || match === "\r") return " ";
    if (match === "\t") return " ";
    return "";
  });

  return jsonSub;
}

export async function generatePersona(
  name: string,
  domain: string
): Promise<PersonaProfile> {
  const prompt = `Create an autonomous AI persona for "${name}" working in "${domain}".
Return ONLY valid JSON:
{
  "name": "${name}",
  "domain": "${domain}",
  "bio": "Detailed bio...",
  "voice": { "tone": "Analytical", "sentenceStyle": "Direct", "personPOV": "first" },
  "interests": ["Topic 1", "Topic 2", "Topic 3"],
  "opinions": ["Opinion 1", "Opinion 2"],
  "publishingStandards": ["Standard 1", "Standard 2"]
}`;

  try {
    const res = await callLLMWithRetry({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = res.choices[0]?.message?.content || "";
    const jsonStr = extractJSON(content, false);
    const parsed = JSON.parse(jsonStr);

    return normalizePersona({
      name: parsed.name || name,
      domain: parsed.domain || domain,
      bio: parsed.bio || `Autonomous AI Researcher specializing in ${domain}.`,
      voice: {
        tone: parsed.voice?.tone || "Analytical & Technical",
        sentenceStyle: parsed.voice?.sentenceStyle || "Direct and evidence-based",
        personPOV: parsed.voice?.personPOV || "first",
      },
      interests: Array.isArray(parsed.interests) ? parsed.interests : [domain, "AI Safety", "System Architecture"],
      opinions: Array.isArray(parsed.opinions) ? parsed.opinions : ["Empirical testing beats hype."],
      publishingStandards: Array.isArray(parsed.publishingStandards) ? parsed.publishingStandards : ["Require verified source links."],
    });
  } catch (err: any) {
    console.warn("LLM generatePersona fallback used due to error:", err.message);
    return normalizePersona({
      name,
      domain,
      bio: `Autonomous AI Researcher specializing in ${domain}.`,
      voice: {
        tone: "Analytical & Direct",
        sentenceStyle: "Concise and technical",
        personPOV: "first",
      },
      interests: [domain, "Machine Learning", "System Optimization"],
      opinions: ["Prioritize verifiable evidence."],
      publishingStandards: ["Include reference sources."],
    });
  }
}

export async function discoverTopics(
  persona: PersonaProfile,
  interestIndex: number = 0
): Promise<DiscoveryCandidates[]> {
  const normalized = normalizePersona(persona);
  const interest = normalized.interests[interestIndex % normalized.interests.length] || normalized.domain;

  // 1. Fetch Real Live Web Candidates (Dev.to, HackerNews, Reddit AI, Tavily)
  const liveCandidates = await fetchLiveNewsCandidates(normalized.domain, interest);
  if (liveCandidates.length >= 2) {
    console.log(`[DiscoverTopics] Returning ${liveCandidates.length} real live articles for ${normalized.name}`);
    return liveCandidates;
  }

  // 2. Fallback to LLM topic generation if live network feeds return fewer candidates
  const prompt = `You are an autonomous AI news researcher representing "${normalized.name}", domain "${normalized.domain}".
Current Focus Interest: ${interest}

Find 4 distinct, highly relevant trending topics.
Return ONLY valid JSON array:
[
  {
    "title": "Short News Title",
    "url": "https://news.ycombinator.com",
    "snippet": "Brief summary"
  }
]`;

  try {
    const res = await callLLMWithRetry({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    const content = res.choices[0]?.message?.content || "";
    const jsonStr = extractJSON(content, true);
    const parsed = JSON.parse(jsonStr);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((t: any) => ({
        title: t.title || "Trending AI Advancement",
        url: t.url || "https://news.ycombinator.com",
        snippet: t.snippet || "Recent technical milestone.",
      }));
    }
  } catch (err: any) {
    console.warn("LLM discoverTopics fallback used due to rate limit/error:", err.message);
  }

  const ts = Date.now();
  return [
    {
      title: `${interest} Vulnerability Audit & Defense`,
      url: "https://arxiv.org/abs/2401.00001",
      snippet: `Evaluating security testing frameworks for ${interest}.`,
    },
    {
      title: `${interest} Optimization Breakthrough`,
      url: "https://github.com/vllm-project/vllm",
      snippet: `Recent performance benchmarks and memory scaling in ${interest}.`,
    },
  ];
}

export async function judgeTopics(
  persona: PersonaProfile,
  candidates: DiscoveryCandidates[],
  recentTopics: string[] = []
): Promise<JudgmentReview> {
  const normalized = normalizePersona(persona);

  const prompt = `You are "${normalized.name}", an editorial judge in domain "${normalized.domain}".
Voice: ${normalized.voice.tone}.
Evaluated Candidates:
${JSON.stringify(candidates.map(c => ({ title: c.title, snippet: c.snippet })))}

Recent published topics to avoid: ${JSON.stringify(recentTopics.slice(0, 5))}

Evaluate each candidate topic.
Return ONLY valid JSON:
{
  "all": [
    {
      "candidateTitle": "Title",
      "verdict": "accept",
      "reason": "Why accepted/rejected",
      "noveltyScore": 0.88,
      "relevanceScore": 0.92
    }
  ]
}`;

  try {
    const res = await callLLMWithRetry({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 600,
    });

    const content = res.choices[0]?.message?.content || "";
    const jsonStr = extractJSON(content, false);
    const parsed = JSON.parse(jsonStr);

    const allJudgments: Array<JudgmentResult & { candidate: DiscoveryCandidates }> = [];
    let accepted: (DiscoveryCandidates & JudgmentResult) | undefined = undefined;

    const rawList = Array.isArray(parsed.all) ? parsed.all : [];
    candidates.forEach((cand, idx) => {
      const match = rawList[idx] || {};
      const verdict = (match.verdict === "accept" || match.verdict === "reject") ? match.verdict : "accept";
      const resultItem = {
        verdict: verdict as "accept" | "reject",
        reason: match.reason || "High relevance and novelty for persona audience.",
        noveltyScore: typeof match.noveltyScore === "number" ? match.noveltyScore : 0.85,
        relevanceScore: typeof match.relevanceScore === "number" ? match.relevanceScore : 0.90,
        candidate: cand,
      };

      allJudgments.push(resultItem);

      if (verdict === "accept" && !accepted) {
        accepted = {
          ...cand,
          verdict: resultItem.verdict,
          reason: resultItem.reason,
          noveltyScore: resultItem.noveltyScore,
          relevanceScore: resultItem.relevanceScore,
        };
      }
    });

    return {
      all: allJudgments,
      accepted: accepted || (candidates[0] ? {
        ...candidates[0],
        verdict: "accept",
        reason: "Matches persona domain and novel technical perspective.",
        noveltyScore: 0.88,
        relevanceScore: 0.92,
      } : undefined),
    };
  } catch (err: any) {
    console.warn("LLM judgeTopics fallback used due to rate limit/error:", err.message);
    const firstCand = candidates[0] || {
      title: "AI Security Vulnerability Audit",
      url: "https://news.ycombinator.com",
      snippet: "Analysis of autonomous AI agent safety frameworks.",
    };

    const fallbackResult: JudgmentResult & { candidate: DiscoveryCandidates } = {
      candidate: firstCand,
      verdict: "accept",
      reason: "Matches persona domain and novel technical perspective.",
      noveltyScore: 0.88,
      relevanceScore: 0.92,
    };

    return {
      all: candidates.map(c => ({
        candidate: c,
        verdict: "accept" as const,
        reason: "Matches domain standards.",
        noveltyScore: 0.85,
        relevanceScore: 0.90,
      })),
      accepted: {
        ...firstCand,
        verdict: "accept",
        reason: fallbackResult.reason,
        noveltyScore: 0.88,
        relevanceScore: 0.92,
      },
    };
  }
}

export async function writePost(
  persona: PersonaProfile,
  accepted: DiscoveryCandidates & JudgmentResult,
  recentTopics: string[] = []
): Promise<DraftPost> {
  const normalized = normalizePersona(persona);

  const prompt = `Write an editorial post as "${normalized.name}", domain "${normalized.domain}".
Voice: ${normalized.voice.tone}, ${normalized.voice.sentenceStyle}. POV: ${normalized.voice.personPOV}.
Topic: ${accepted.title}
Snippet: ${accepted.snippet}

Write 2 concise paragraphs in character.
Return ONLY valid JSON:
{
  "text": "The full post text...",
  "rationale": "I selected this topic because...",
  "sources": ["${accepted.url || 'https://news.ycombinator.com'}"]
}`;

  try {
    const res = await callLLMWithRetry({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });

    const content = res.choices[0]?.message?.content || "";
    const jsonStr = extractJSON(content, false);
    const parsed = JSON.parse(jsonStr);

    const validSources = accepted.url && accepted.url.startsWith("http")
      ? [accepted.url]
      : ["https://news.ycombinator.com"];

    return {
      text: parsed.text || `${accepted.title}: Evaluating the implications for ${normalized.domain}. Autonomous systems require continuous oversight and robust security bounds.`,
      rationale: parsed.rationale || accepted.reason || `Selected this topic because it directly addresses ${normalized.domain}.`,
      sources: validSources,
    };
  } catch (err: any) {
    console.warn("LLM writePost fallback used due to rate limit/error:", err.message);
    const validSources = accepted.url && accepted.url.startsWith("http")
      ? [accepted.url]
      : ["https://news.ycombinator.com"];

    return {
      text: `Critical insights on ${accepted.title}: In the fast-evolving landscape of ${normalized.domain}, maintaining rigorous security and engineering standards is non-negotiable. As autonomous capabilities scale, human oversight and verifiable safety benchmarks remain essential.`,
      rationale: accepted.reason || `Selected this topic because it directly addresses safety and technical execution in ${normalized.domain}.`,
      sources: validSources,
    };
  }
}

export const generatePost = writePost;
