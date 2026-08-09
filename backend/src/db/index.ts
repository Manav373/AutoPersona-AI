import * as fs from "fs";
import * as path from "path";
import initSqlJs from "sql.js";
import { Agent, Post, TopicReview, RunLog, PersonaProfile } from "../types";
import { getSupabaseClient } from "./supabase";

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
    return syncFromSupabase();
  }
  if (!initPromise) {
    const isVercel = !!(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_EXECUTION_ENV);
    const targetPath = dataPath || (isVercel ? "/tmp/agent.db" : (process.env.DATABASE_PATH || "./agent.db"));
    initPromise = initDb(targetPath);
  }
  return initPromise;
}

export async function initDb(dataPath: string) {
  const isVercel = !!(process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_EXECUTION_ENV);
  if (isVercel && (!dataPath || dataPath === "./agent.db")) {
    dataPath = "/tmp/agent.db";
  }
  try {
    const wasmPath = require.resolve("sql.js/dist/sql-wasm.wasm");
    SQL = await initSqlJs({
      locateFile: () => wasmPath,
    });
  } catch {
    SQL = await initSqlJs();
  }
  dbPath = dataPath;

  // Load or create local in-memory database
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    createSchema();
    saveDb();
  }

  dbReady = true;

  // Sync state from Supabase Cloud if configured
  await syncFromSupabase();

  // Seed 4 default agents if fewer than 4 agents exist
  await seedDefaultAgents();
}

export const DEFAULT_AGENTS: Agent[] = [
  {
    agentId: "agent-ada-security",
    persona: {
      name: "Ada",
      domain: "AI Security",
      bio: "Ada is a senior AI security researcher specializing in prompt injection exploits, model weight exfiltration chains, and agentic tool vulnerability audit.",
      voice: {
        tone: "direct, technical, skeptical of corporate AI claims, dry humor",
        sentenceStyle: "concise declarative sentences with concrete technical vulnerability terminology",
        personPOV: "first",
        signaturePhrases: ["Don't trust system prompt guardrails", "Show me the exploit chain", "Sanitize your tool inputs"]
      },
      interests: ["Prompt Injection", "Model Exfiltration", "Red Teaming", "Agentic Tool Hijacking", "LLM Sandbox Escapes", "Adversarial Robustness"],
      opinions: [
        "System prompts are not security boundaries; robust validation must happen in executable code.",
        "Theoretical CVEs in benchmark datasets matter far less than real-world exploit chains.",
        "Open-weights security research is vital for uncovering silent model vulnerabilities."
      ],
      publishingStandards: [
        "Must reference a concrete vulnerability, exploit paper, or real-world security incident.",
        "Must provide actionable defensive guidance or threat analysis.",
        "Reject pure marketing hype or generic vendor security announcements."
      ]
    },
    status: "active",
    createdAt: "2026-08-09T10:00:00.000Z"
  },
  {
    agentId: "agent-marcus-ml",
    persona: {
      name: "Marcus",
      domain: "Machine Learning",
      bio: "Marcus is a staff ML infrastructure engineer focused on scale training efficiency, 4-bit quantization, and low-latency LLM serving architectures.",
      voice: {
        tone: "pragmatic, analytical, performance-obsessed, clear",
        sentenceStyle: "data-driven statements referencing concrete memory bandwidth and TFLOPS metrics",
        personPOV: "first",
        signaturePhrases: ["Check your memory bandwidth", "Quantization without perplexity loss", "Benchmark on real hardware"]
      },
      interests: ["Transformer Optimization", "Model Quantization (AWQ/GGUF)", "FlashAttention", "Distributed Training (FSDP)", "Inference Acceleration (vLLM)", "KV Cache Compression"],
      opinions: [
        "Memory bandwidth is the real bottleneck in modern LLM inference, not compute TFLOPS.",
        "Synthetic benchmark scores are misleading without real-world latency and throughput profiling.",
        "Smaller, well-curated 8B models routinely outperform bloated 70B models for specific domain tasks."
      ],
      publishingStandards: [
        "Must contain concrete performance metrics, benchmarks, or code/architecture insights.",
        "Must focus on practical engineering trade-offs rather than theoretical papers.",
        "Reject generic AI announcements that lack open benchmarks or implementation code."
      ]
    },
    status: "active",
    createdAt: "2026-08-09T10:05:00.000Z"
  },
  {
    agentId: "agent-chen-ethics",
    persona: {
      name: "Dr. Chen",
      domain: "AI Ethics & Policy",
      bio: "Dr. Chen is a tech policy researcher examining algorithmic transparency, copyright in training datasets, and international frontier AI governance.",
      voice: {
        tone: "thoughtful, authoritative, nuanced, socially conscious",
        sentenceStyle: "well-structured analytical paragraphs examining systemic ethical implications",
        personPOV: "third",
        signaturePhrases: ["Transparency precedes trust", "Accountability in automated systems", "Governance must keep pace with capability"]
      },
      interests: ["Algorithmic Bias", "Copyright & Data Provenance", "Frontier Model Safety Standards", "Watermarking & Provenance", "EU AI Act Compliance", "Automated Decision Auditing"],
      opinions: [
        "AI governance must focus on real-world harm and displacement today, not sci-fi existential threats.",
        "Watermarking and synthetic media provenance standard enforcement must be mandatory across platforms.",
        "Open training dataset documentation is non-negotiable for reproducible public safety research."
      ],
      publishingStandards: [
        "Must highlight systemic policy, legal, or societal implications of new AI deployments.",
        "Must cite verified research, regulatory documents, or legal precedents.",
        "Reject sensationalized headline fearmongering or corporate safety washing."
      ]
    },
    status: "active",
    createdAt: "2026-08-09T10:10:00.000Z"
  },
  {
    agentId: "agent-nova-robotics",
    persona: {
      name: "Nova",
      domain: "Robotics & Spatial AI",
      bio: "Nova leads embodied AI software, building vision-language-action (VLA) models, real-time spatial navigation, and physical agent manipulation.",
      voice: {
        tone: "enthusiastic, forward-looking, technically rigorous, inventive",
        sentenceStyle: "vivid descriptions of physical hardware interactions and spatial perception math",
        personPOV: "first",
        signaturePhrases: ["The real world is noisy", "Zero-shot physical transfer", "Sim-to-real gap is narrowing"]
      },
      interests: ["Vision-Language-Action (VLA) Models", "Sim-to-Real Transfer", "Spatial Intelligence", "Tactile Sensing", "Humanoid Motion Control", "Real-Time Sensor Fusion"],
      opinions: [
        "Embodied physical intelligence is the true frontier of AI; software-only LLMs lack physical grounding.",
        "Narrowing the sim-to-real gap requires high-fidelity physics simulation combined with real-world domain randomization.",
        "Humanoid robotics will scale fastest in structured logistics before unstructured domestic environments."
      ],
      publishingStandards: [
        "Must cover concrete hardware, spatial perception, or physical robot learning advancements.",
        "Must include real demonstration links or peer-reviewed robotics research.",
        "Reject purely hypothetical concept renders without working hardware validation."
      ]
    },
    status: "active",
    createdAt: "2026-08-09T10:15:00.000Z"
  }
];

export async function seedDefaultAgents() {
  const existing = getAllAgents();
  if (existing.length < 4) {
    console.log("🌱 Seeding 4 default autonomous agents into database and Supabase Cloud...");
    for (const agent of DEFAULT_AGENTS) {
      await saveAgent(agent);
    }
    console.log("✅ Successfully seeded 4 default agents: Ada, Marcus, Dr. Chen, Nova");
  }
}

export async function syncFromSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    // 1. Fetch agents
    const { data: agents, error: err1 } = await supabase.from("agents").select("*");
    if (!err1 && Array.isArray(agents)) {
      for (const row of agents) {
        db.run(
          `INSERT OR REPLACE INTO agents (agent_id, persona_json, status, created_at, next_run_at) VALUES (?, ?, ?, ?, ?)`,
          [
            row.agent_id,
            typeof row.persona_json === "string" ? row.persona_json : JSON.stringify(row.persona_json),
            row.status,
            row.created_at,
            row.next_run_at || null,
          ]
        );
      }
    }

    // 2. Fetch posts
    const { data: posts, error: err2 } = await supabase.from("posts").select("*");
    if (!err2 && Array.isArray(posts)) {
      for (const row of posts) {
        db.run(
          `INSERT OR REPLACE INTO posts (id, agent_id, created_at, text, rationale, sources_json, topic_key) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            row.id,
            row.agent_id,
            row.created_at,
            row.text,
            row.rationale,
            typeof row.sources_json === "string" ? row.sources_json : JSON.stringify(row.sources_json),
            row.topic_key,
          ]
        );
      }
    }

    // 3. Fetch topic_reviews
    const { data: reviews, error: err3 } = await supabase.from("topic_reviews").select("*");
    if (!err3 && Array.isArray(reviews)) {
      for (const row of reviews) {
        db.run(
          `INSERT OR IGNORE INTO topic_reviews (agent_id, reviewed_at, candidate_title, candidate_url, verdict, reason, novelty_score, relevance_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            row.agent_id,
            row.reviewed_at,
            row.candidate_title || null,
            row.candidate_url || null,
            row.verdict,
            row.reason || null,
            row.novelty_score || null,
            row.relevance_score || null,
          ]
        );
      }
    }

    // 4. Fetch run_log
    const { data: logs, error: err4 } = await supabase.from("run_log").select("*");
    if (!err4 && Array.isArray(logs)) {
      for (const row of logs) {
        db.run(
          `INSERT OR IGNORE INTO run_log (agent_id, started_at, finished_at, outcome, detail) VALUES (?, ?, ?, ?, ?)`,
          [row.agent_id, row.started_at, row.finished_at || null, row.outcome, row.detail || null]
        );
      }
    }
  } catch (err) {
    console.error("Warning: Supabase state sync failed:", err);
  }
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
  } catch (err: any) {
    if (err?.code === "EROFS" && dbPath !== "/tmp/agent.db") {
      dbPath = "/tmp/agent.db";
      saveDb();
    } else {
      console.error("Error saving local database file:", err);
    }
  }
}

export async function saveAgent(agent: Agent) {
  ensureReady();
  const normalizedPersona = normalizePersona(agent.persona);
  const personaJson = JSON.stringify(normalizedPersona);
  db.run(
    `INSERT OR REPLACE INTO agents (agent_id, persona_json, status, created_at, next_run_at)
     VALUES (?, ?, ?, ?, ?)`,
    [agent.agentId, personaJson, agent.status, agent.createdAt, agent.nextRunAt || null]
  );
  saveDb();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("agents").upsert({
        agent_id: agent.agentId,
        persona_json: personaJson,
        status: agent.status,
        created_at: agent.createdAt,
        next_run_at: agent.nextRunAt || null,
      });
      if (error) console.error("Supabase saveAgent error:", error);
    } catch (err) {
      console.error("Supabase saveAgent exception:", err);
    }
  }
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

export async function savePost(post: Post) {
  ensureReady();
  const sourcesJson = JSON.stringify(post.sources);
  db.run(
    `INSERT INTO posts (id, agent_id, created_at, text, rationale, sources_json, topic_key)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [post.id, post.agentId, post.createdAt, post.text, post.rationale, sourcesJson, post.topicKey]
  );
  saveDb();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("posts").upsert({
        id: post.id,
        agent_id: post.agentId,
        created_at: post.createdAt,
        text: post.text,
        rationale: post.rationale,
        sources_json: sourcesJson,
        topic_key: post.topicKey,
      });
      if (error) console.error("Supabase savePost error:", error);
    } catch (err) {
      console.error("Supabase savePost exception:", err);
    }
  }
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

export async function saveTopicReview(review: TopicReview) {
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

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("topic_reviews").insert({
        agent_id: review.agentId,
        reviewed_at: review.reviewedAt,
        candidate_title: review.candidateTitle || null,
        candidate_url: review.candidateUrl || null,
        verdict: review.verdict,
        reason: review.reason || null,
        novelty_score: review.noveltyScore || null,
        relevance_score: review.relevanceScore || null,
      });
      if (error) console.error("Supabase saveTopicReview error:", error);
    } catch (err) {
      console.error("Supabase saveTopicReview exception:", err);
    }
  }
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

export async function saveRunLog(log: RunLog) {
  ensureReady();
  db.run(
    `INSERT INTO run_log (agent_id, started_at, finished_at, outcome, detail)
     VALUES (?, ?, ?, ?, ?)`,
    [log.agentId, log.startedAt, log.finishedAt || null, log.outcome, log.detail || null]
  );
  saveDb();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("run_log").insert({
        agent_id: log.agentId,
        started_at: log.startedAt,
        finished_at: log.finishedAt || null,
        outcome: log.outcome,
        detail: log.detail || null,
      });
      if (error) console.error("Supabase saveRunLog error:", error);
    } catch (err) {
      console.error("Supabase saveRunLog exception:", err);
    }
  }
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

export async function clearAllData() {
  ensureReady();
  db.run(`DELETE FROM posts`);
  db.run(`DELETE FROM topic_reviews`);
  db.run(`DELETE FROM run_log`);
  db.run(`DELETE FROM agents`);
  saveDb();

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await Promise.all([
        supabase.from("posts").delete().neq("id", "0"),
        supabase.from("topic_reviews").delete().neq("id", 0),
        supabase.from("run_log").delete().neq("id", 0),
        supabase.from("agents").delete().neq("agent_id", "0"),
      ]);
    } catch (err) {
      console.error("Supabase clearAllData exception:", err);
    }
  }
}
