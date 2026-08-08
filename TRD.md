# Technical Requirements Document (TRD)
## Project: Autonomous AI Creator — "Persona Agent"

**Version:** 1.0
**Companion to:** PRD.md

---

## 1. Architecture Overview

```
                         ┌─────────────────────────────┐
                         │        HTTP API Layer        │
                         │  POST /api/agent/init        │
                         │  GET  /api/agent/feed        │
                         └───────────────┬──────────────┘
                                          │
                     ┌────────────────────────────────────┐
                     │           Agent Runtime             │
                     │  (one instance per agentId)          │
                     │                                       │
                     │  ┌─────────────┐   ┌───────────────┐ │
                     │  │  Scheduler   │──▶│ Discovery      │ │
                     │  │ (interval +  │   │ (web search)   │ │
                     │  │  jitter)     │   └──────┬────────┘ │
                     │  └─────────────┘          ▼           │
                     │                  ┌───────────────────┐│
                     │                  │ Editorial Judgment ││
                     │                  │ (LLM scoring vs.   ││
                     │                  │  persona rubric +  ││
                     │                  │  memory dedup)     ││
                     │                  └────────┬──────────┘│
                     │                            ▼            │
                     │                  ┌───────────────────┐│
                     │                  │ Writer (LLM,       ││
                     │                  │ persona system     ││
                     │                  │ prompt) + Rationale││
                     │                  └────────┬──────────┘│
                     │                            ▼            │
                     │                  ┌───────────────────┐│
                     │                  │ Persistence Layer  ││
                     │                  │ (SQLite): posts,   ││
                     │                  │ rejected topics,   ││
                     │                  │ persona, scheduler ││
                     │                  │ state              ││
                     │                  └───────────────────┘│
                     └────────────────────────────────────┘
```

Single-process design. One long-running Node.js (or Python) server hosts both the HTTP API and the background scheduler loop in-process. This avoids the complexity/fragility of separate cron infra for a 48-hour, single-agent-at-a-time workload.

## 2. Tech Stack (recommended)

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 20+ / TypeScript | First-class `setTimeout`/`setInterval` scheduling in-process, easy JSON API, fast to build. (Python + FastAPI + APScheduler is an equally valid alternative — see §3.6.) |
| HTTP framework | Express | Minimal, matches 2-endpoint scope. |
| LLM | Anthropic Claude API (`claude-sonnet-4-6` or current default) | Persona generation, editorial scoring, writing, rationale — all via the Messages API. |
| Web search | Anthropic's `web_search` server tool (via Messages API `tools`), or a dedicated search API (Tavily / Brave Search / Bing) | "Live information source" requirement; using Claude's built-in web_search tool avoids managing a second API key. |
| Storage | SQLite (via `better-sqlite3`) | Durable, zero-ops, survives process restart, trivially inspectable for debugging/demo. |
| Process host | Always-on VM/container (Render "Web Service", Railway, Fly.io, or a small EC2/Droplet with `pm2`) | Must NOT be pure serverless (Vercel/Netlify functions) — those don't keep a background loop alive between requests. See §8. |
| Process supervisor | `pm2` or platform-native restart policy | Auto-restart on crash so the 48h loop self-heals. |

## 3. Component Design

### 3.1 Persona Module
On `init`, expand the minimal `{ name, domain }` into a full **PersonaProfile** via one LLM call, then freeze it for the run:

```ts
interface PersonaProfile {
  name: string;
  domain: string;
  bio: string;                 // 1-2 sentence self-description
  voice: {
    tone: string;               // e.g. "direct, technically precise, dry humor"
    sentenceStyle: string;      // e.g. "short declarative sentences, occasional rhetorical question"
    personPOV: "first" | "third";
    signaturePhrases?: string[];
  };
  interests: string[];          // 5-8 bounded sub-topics
  opinions: string[];           // 4-6 recurring stances, phrased as beliefs
  publishingStandards: string[]; // explicit rubric used at judgment time
}
```
This object is stored once in SQLite and passed as part of the **system prompt** for every subsequent LLM call (discovery filtering, judgment, writing) for that agent — never regenerated. This is what guarantees §6.3 (persona consistency) in the PRD.

### 3.2 Scheduler
- On successful `init`, start a recurring loop for that `agentId`: `runCycle()` immediately, then reschedule with `setTimeout` using `randomBetween(MIN_INTERVAL, MAX_INTERVAL)` (e.g. 90–240 minutes) so posting cadence lands around 6–12 posts over 48h with human-like jitter, per PRD §6.5.
- Each scheduled run time is persisted (`next_run_at`) so that on process restart, the app can catch up rather than double-fire or silently stop.
- On boot, the app loads any agent found in SQLite with `status = 'active'` and resumes its schedule automatically — this makes the whole system restart-safe (PRD Risk table).
- Loop body never throws uncaught: every stage wrapped in try/catch, failures logged to a `run_log` table, cycle just ends early and reschedules normally.

### 3.3 Discovery Module
- Calls the search tool with a query built from `persona.interests` (rotate through interests across cycles so coverage doesn't fixate on one sub-topic).
- Returns N raw candidates: `{ title, url, snippet, publishedAt? }`.
- No filtering happens here — this stage is "gather," judgment is a separate stage (keeps responsibilities and logs clean/demoable).

### 3.4 Editorial Judgment Module
- Single LLM call per cycle: input = persona profile + `publishingStandards` + the candidate list + a compact summary of recently published/rejected topics (from memory, §3.6) for dedup context.
- Output (forced JSON): for each candidate, `{ verdict: "accept" | "reject", reason: string, noveltyScore: 0-1, relevanceScore: 0-1 }`, plus which single candidate (if any) is the cycle's pick.
- All verdicts — accepted **and rejected** — are written to a `topic_reviews` table. This is the artifact that proves "editorial judgment" happened, even though only accepted topics become posts.
- Hard rule enforced in code (not just prompted): if the top candidate's `noveltyScore` is below threshold or its topic-key matches something in memory, force `verdict = reject` regardless of what the model says — deterministic backstop against duplicate publishing.

### 3.5 Writer Module
- Only invoked if judgment produced an `accept`.
- One LLM call: persona system prompt + accepted topic + source snippets → returns `{ text, rationale, sources }` as forced JSON.
  - `text`: the actual post (persona voice, length ~80–280 words, no markdown headers — reads like a real short-form post).
  - `rationale`: 2–4 sentences covering *why selected* / *why now* / *why over alternatives* (directly satisfies PRD §6.6).
  - `sources`: real URLs carried through from the discovery candidate (never invented).
- A lightweight self-check re-prompt (or regex/heuristic) rejects drafts that are near-duplicates of a prior post's `text` (Levenshtein/embedding similarity) as a final safety net before persisting.

### 3.6 Memory Module
- Table `posts` is memory-of-record. Additional derived memory helpers:
  - `topic_key` (normalized slug of the subject) stored per post for cheap exact-match dedup.
  - Optional: store an embedding (via Claude/OpenAI embeddings or a local model) of each post's `text` for semantic near-duplicate detection; cosine similarity above threshold ⇒ treat as duplicate.
- Memory context passed into both the Judgment and Writer prompts as a short bulleted list of "already covered" topics (most recent N, to keep prompt size bounded over 48h).

### 3.7 Persistence Layer — Schema (SQLite)

```sql
CREATE TABLE agents (
  agent_id TEXT PRIMARY KEY,
  persona_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',   -- active | stopped
  created_at TEXT NOT NULL,
  next_run_at TEXT
);

CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,       -- ISO 8601 UTC
  text TEXT NOT NULL,
  rationale TEXT NOT NULL,
  sources_json TEXT NOT NULL,      -- JSON array of URLs
  topic_key TEXT NOT NULL,
  embedding_json TEXT,             -- optional
  FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
);

CREATE TABLE topic_reviews (      -- editorial judgment audit trail
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  candidate_title TEXT,
  candidate_url TEXT,
  verdict TEXT NOT NULL,          -- accept | reject
  reason TEXT,
  novelty_score REAL,
  relevance_score REAL
);

CREATE TABLE run_log (            -- scheduler health/debug trail
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  outcome TEXT,                   -- published | skipped_no_candidates | skipped_all_rejected | error
  detail TEXT
);
```

## 4. API Spec (authoritative — must match byte-for-byte on field names)

### `POST /api/agent/init`
- **Body:** `{ "persona": { "name": string, "domain": string } }`
- **Behavior:**
  1. Validate body; 400 if `persona.name`/`persona.domain` missing.
  2. Generate `agentId` (uuid).
  3. Run Persona Module to build full `PersonaProfile`.
  4. Insert `agents` row, `status='active'`.
  5. Kick off scheduler for this agent (fires first cycle immediately, async — **do not block the HTTP response** on the first content cycle).
  6. Return `{ "agentId": "<uuid>" }` with 200.
- **Idempotency guard:** although the evaluator calls this once, defensively: if called again, either return the existing `agentId` for an identical persona or create a distinct new agent — document the choice; recommended: always create a new independent agent (simplest, matches "no shared state" assumption) unless product wants dedup.

### `GET /api/agent/feed?agentId=...`
- 404 (or `{ "posts": [] }` with 200 — recommend the latter per "no-posts" contract symmetry, but 404 is acceptable if `agentId` truly unknown; document your choice) if agent not found.
- Query `posts` where `agent_id = ?`, `ORDER BY created_at DESC`.
- Map rows to:
```json
{
  "id": "p7",
  "createdAt": "2026-08-07T10:30:00Z",
  "text": "...",
  "rationale": "...",
  "sources": ["https://..."]
}
```
- Wrap in `{ "posts": [...] }`. Never mutate/remove previously returned posts (append-only table; feed endpoint is pure read).

## 5. LLM Prompting Strategy

Use **one persistent system prompt per agent**, built once at init and stored (or reconstructed deterministically from the stored `PersonaProfile`), reused for every call type with a small task-specific prefix:

1. **Persona-generation prompt** (init only): "You are creating a durable persona for an autonomous content agent... return JSON matching schema X."
2. **Judgment prompt** (each cycle): system = persona + standards; user = candidate list + recent-topics memory; forced JSON output; low temperature (deterministic-ish judgment).
3. **Writer prompt** (on accept): system = persona voice; user = accepted topic + source snippets + explicit instruction "do not repeat these already-covered angles: [...]"; moderate temperature for natural variation within the fixed voice.

All three use Anthropic's structured/JSON-forcing pattern (system instruction: "Respond with ONLY valid JSON, no prose, no markdown fences") with a parse-and-retry-once fallback if the JSON fails to parse.

## 6. Autonomous Loop — Pseudocode

```ts
async function runCycle(agentId: string) {
  const agent = loadAgent(agentId);
  logRunStart(agentId);
  try {
    const candidates = await discoverTopics(agent.persona);
    if (!candidates.length) return logSkip(agentId, "no_candidates");

    const memory = getRecentTopics(agentId, 20);
    const review = await judgeTopics(agent.persona, candidates, memory);
    saveTopicReviews(agentId, review.all);

    if (!review.accepted) return logSkip(agentId, "all_rejected");
    if (isDuplicate(agentId, review.accepted)) return logSkip(agentId, "dedup_blocked");

    const draft = await writePost(agent.persona, review.accepted, memory);
    if (isNearDuplicateText(agentId, draft.text)) return logSkip(agentId, "near_duplicate_text");

    savePost(agentId, draft);
    logRunFinish(agentId, "published");
  } catch (err) {
    logRunFinish(agentId, "error", err);
  } finally {
    const next = Date.now() + randomBetween(MIN_MS, MAX_MS);
    updateNextRunAt(agentId, next);
    setTimeout(() => runCycle(agentId), next - Date.now());
  }
}
```
On process boot: `for each agent where status='active': resumeSchedule(agent)` — either fire immediately if `next_run_at` is in the past, or schedule the remaining delay.

## 7. Deployment

- **Must** run on an always-on process host — a background `setTimeout`/interval loop is killed by serverless platforms between invocations (Vercel/Netlify Functions, AWS Lambda without a keep-warm hack).
- Recommended: Render "Background Worker" combined with a "Web Service" for the API in the same repo (or a single Web Service if the platform keeps the dyno alive — verify no idle-sleep on the plan used), Railway, Fly.io, or a small always-on VM with `pm2 start` + `pm2 save` + startup script.
- Environment variables: `ANTHROPIC_API_KEY`, optional `SEARCH_API_KEY`, `DATABASE_PATH`, `MIN_CYCLE_MINUTES`, `MAX_CYCLE_MINUTES`, `PORT`.
- SQLite file must be on a persistent volume, not ephemeral container storage that resets on redeploy.

## 8. Reliability & Recovery

- Every external call (search, LLM) wrapped with timeout + single retry + exponential-ish backoff; on repeated failure, log and skip the cycle — the loop itself must never die.
- `pm2`/platform restart policy relaunches the process on crash; boot-time resume logic (§6) re-establishes schedules so a crash mid-window causes at most one missed cycle, not a dead agent.
- Health check: a simple internal `/healthz` (not part of the graded contract, but useful for the host's uptime monitor) is recommended.

## 9. Security & Cost Controls

- API keys via environment variables only, never returned in any response.
- Cap discovery/generation calls per cycle (fixed candidate count, e.g. 5–8) to bound token spend over 48h.
- Basic input validation on `init` body to avoid prompt-injection style payloads in `persona.name/domain` reaching the system prompt unsanitized (treat as untrusted user text: quote/delimit clearly in the prompt template).

## 10. Testing Plan

| Test | Method |
|---|---|
| API contract shape | Unit tests asserting exact JSON field names/types for both endpoints, including empty-feed case. |
| Ordering & immutability | Insert posts out of order; assert feed returns newest-first and earlier reads are unaffected by later writes. |
| Dedup | Feed two near-identical candidate topics across two cycles; assert second is rejected/skipped with a logged reason. |
| Persona consistency (manual/LLM-graded) | After several posts, run a held-out "does this read as one consistent voice?" check (human read or a separate LLM grading pass) before submission. |
| Restart resilience | Kill the process mid-window in a local soak test; confirm it resumes scheduling on boot without duplicate or lost cycles. |
| Full soak test | Run locally/staged for 6–12+ hours before submission to confirm cadence, judgment, and memory all behave over real elapsed time, not just in a fast-forwarded test. |

## 11. Open Decisions to Finalize Before Building

1. Node/Express vs. Python/FastAPI + APScheduler — either satisfies this TRD; pick based on team familiarity.
2. Search source: Anthropic `web_search` tool (simplest, one API key) vs. dedicated search API (more control over recency/domain filters).
3. Exact cadence bounds (suggest 90–240 min jitter ⇒ ~8–10 posts/48h, comfortably inside "paced, not batched").
4. 404 vs. `{ "posts": [] }` for unknown `agentId` — pick one, document it, keep it consistent.
