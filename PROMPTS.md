# AI Usage Log & Complete Prompt History

> **Submission Requirement**: Stage 1 & Stage 2 Hackathon Verification Document  
> **Project**: CogniPulse — Autonomous AI Creator  
> **Repository**: [Manav373/CogniPulse](https://github.com/Manav373/CogniPulse)  
> **Hackathon**: Autonomous AI Creator Challenge  
> **Team**: Manav373  
> **Development Period**: August 8–9, 2026  

---

## 1. Overview of AI Tooling

Throughout the creation of **CogniPulse**, AI tools were used across all stages of ideation, architecture, backend implementation, frontend design, animation physics, testing, and deployment.

| Tool / Model | Primary Usage | Contribution Area |
| :--- | :--- | :--- |
| **Antigravity AI Agent (Gemini)** | Full-stack architecture, frontend design, UI animations, system integration, debugging, and polish | End-to-end codebase iteration, component scaffolding, CSS design system |
| **Claude Code (Anthropic)** | Backend autonomous runtime — LLM topic discovery, editorial judgment scoring, post generation, persona expansion | Production AI Agent Engine, autonomous loop implementation |
| **Groq LLM API (Llama 3.3 70B)** | Runtime inference engine — persona generation, topic judgment, post writing at production scale | Agent intelligence layer with multi-key round-robin for rate-limit resilience |
| **Framer Motion** | Motion physics, spring animations, UI micro-interactions, page transitions | Frontend visual polish & interactive canvas |
| **GSAP + ScrollTrigger** | Scroll-driven animations, parallax effects, landing page kinetic typography | Landing page cinematic experience |

---

## 2. Development Workflow & Feature Mapping

### Phase 1: Planning & Specification (PRD / TRD)
- **AI Task**: Formulated Product Requirements Document (`PRD.md`) and Technical Requirements Document (`TRD.md`).
- **Prompt Focus**: Defining strict HTTP API contracts (`POST /api/agent/init`, `GET /api/agent/feed`), data schema definitions (SQLite tables for `posts`, `personas`, `topic_reviews`, `run_log`), and autonomous loop jitter mechanics (90–240 min cycles).
- **Output**: Authoritative specifications that drive deterministic execution.

### Phase 2: Backend Architecture & Resilience
- **AI Task**: Implemented Express service with non-blocking background scheduler (`backend/src/services/scheduler.ts`), Groq LLM client with multi-key round-robin (`backend/src/services/llm.ts`), live news fetcher (`backend/src/services/fetcher.ts`), and SQLite persistence (`backend/src/db/index.ts`).
- **Prompt Focus**: Guaranteed non-blocking API response on `init`, exact-match topic key dedup, similarity memory checks, auto-resumption on boot, multi-API-key pool rotation for Groq rate-limit mitigation, and fallback model cascade (Llama 3.3 70B → Llama 3.1 8B → Mixtral 8x7B → Gemma2 9B).
- **Output**: Production-ready asynchronous agent runtime with fault tolerance.

### Phase 3: Frontend Control Room & Workflow Builder
- **AI Task**: Developed React + Vite control room featuring an interactive SVG/Framer Motion workflow canvas (`WorkflowCanvas.tsx`), multi-agent log stream (`LogsTab.tsx`), judgment audit tab (`JudgmentTab.tsx`), live feed preview (`FeedTab.tsx`), persona deep-inspect panel (`PersonaTab.tsx`), overview dashboard (`OverviewView.tsx`), and credential/variable management views.
- **Prompt Focus**: Modern dark/light glassmorphic UI, category-themed graph nodes, connection cables, global command bar search, and workspace navigation header.
- **Output**: Full-featured, responsive visualization & management dashboard with 19+ components.

### Phase 4: Landing Page, Auth & Onboarding
- **AI Task**: Built cinematic landing page (`LandingPage.tsx`) with GSAP ScrollTrigger parallax, interactive 3D agent visualization (`Interactive3DAgent.tsx`), and premium auth page (`AuthPage.tsx`) with password strength meter, form validation, and animated transitions.
- **Prompt Focus**: Hero section with kinetic typography, feature cards with gradient icons, workflow pipeline visualization, testimonial sections, and CTA buttons with spring physics.
- **Output**: Visually stunning onboarding flow matching top-tier SaaS products.

### Phase 5: Motion Physics & Aesthetic Polish
- **AI Task**: Refined visual aesthetics, expanded sidebars with spring animations, smooth light-mode contrast fixes, dynamic theme tokens, custom scrollbars, and micro-interactions across every interactive element.
- **Prompt Focus**: Micro-interactions, hover effects, CSS variable tokens, SVG cable layout math, adaptive layout panels, and theme-aware color systems.
- **Output**: High-end modern design system meeting top-tier visual standards.

---

## 3. Complete Prompt History — Every Single Prompt Used

> **Note**: Every prompt below was actually used during the hackathon development of CogniPulse. Each prompt is presented in full, exactly as submitted, with no omissions. Prompts are listed in chronological development order.

---

### Prompt 1: Product Requirements Document (PRD) Generation

```text
I am building a submission for a hackathon challenge called "Autonomous AI Creator." The challenge requires building an AI agent that, once initialized with a persona (name + domain), operates fully autonomously for approximately 48 hours — discovering topics from the real world, making genuine editorial judgments about what is worth publishing, writing posts in a consistent persona voice, maintaining memory to avoid repetition, and publishing at a natural human-like cadence with no further human input required after the initial setup call.

The submission is evaluated through exactly two HTTP API endpoints:
1. POST /api/agent/init — accepts { "persona": { "name": "Ada", "domain": "AI Security" } } and returns { "agentId": "abc-123" }
2. GET /api/agent/feed?agentId=abc-123 — returns { "posts": [{ "id": "p7", "createdAt": "ISO8601", "text": "...", "rationale": "...", "sources": ["https://..."] }] }

Write me a comprehensive Product Requirements Document (PRD) that covers:
- Background and problem statement explaining why this agent is different from typical AI content generation (which is human-triggered, prompt-by-prompt)
- Clear numbered goals: G1 through G7 covering autonomous operation, editorial judgment quality, persona consistency, working memory, paced publishing, rationale transparency, and 48-hour survivability
- Non-goals explicitly listing what is OUT of scope: no real social media posting, no multi-platform formatting, no images/video, no engagement metrics, no multi-agent systems, no human-in-the-loop after init, no authentication
- User/evaluator description explaining the exact evaluation workflow
- Persona requirements specifying that the agent must expand a minimal { name, domain } into a full identity with stable voice (sentence rhythm, vocabulary, formality, humor style, POV), stable interests (bounded sub-topics), distinct editorial opinions (recurring stances), and a publishing standards rubric
- Include recommended default persona archetypes: AI Security Researcher, ML Engineer, AI Product Analyst, OSS Contributor, Robotics Engineer, Developer Advocate, AI Ethics Researcher
- Functional requirements for: Topic Discovery (live sources, repeated over 48h, multiple candidates per cycle), Editorial Judgment (scoring against explicit criteria — fit, novelty, substance, timeliness — with rejected topics logged with reasons), Consistent Persona (same system prompt reused, never regenerated), Memory (persisted topic keys, dedup checks, survives restarts), Autonomous Publishing (scheduler with randomized jitter, target 6-12 posts over 48h), and Publishing Rationale (every post includes why selected, why now, real source URLs)
- API requirements matching the exact contract byte-for-byte
- Success metrics table mapping each evaluation criterion to what "good" looks like
- Constraints and assumptions about the 48-hour window, simulated publishing, always-on hosting requirements, and API cost/rate-limit budgeting
- Risks and mitigations table covering: serverless host killing the scheduler, LLM/search API outages, empty discovery results, duplicate post slip-through, and process restart state loss
- Milestones from API contract → discovery → judgment → memory → scheduler → deployment soak test

Format this as a clean, professional Markdown document with tables, numbered sections, and code blocks for the API examples. This will serve as the authoritative specification for the entire build.
```

---

### Prompt 2: Technical Requirements Document (TRD) Generation

```text
Now write a companion Technical Requirements Document (TRD) that serves as the implementation blueprint for the PRD we just created. This TRD should be comprehensive enough that a developer can build the entire system from it without needing to ask clarifying questions. Include:

1. Architecture Overview — draw an ASCII art diagram showing the full system: HTTP API Layer (POST /api/agent/init, GET /api/agent/feed) → Agent Runtime (one instance per agentId) containing Scheduler (interval + jitter) → Discovery (web search) → Editorial Judgment (LLM scoring vs. persona rubric + memory dedup) → Writer (LLM, persona system prompt + rationale) → Persistence Layer (SQLite: posts, rejected topics, persona, scheduler state)

2. Tech Stack table with justified choices: Node.js 20+ TypeScript (for in-process setTimeout scheduling), Express (minimal, matches 2-endpoint scope), Anthropic Claude API for all LLM calls (persona generation, editorial scoring, writing, rationale), Anthropic's built-in web_search server tool for topic discovery (avoids second API key), SQLite via better-sqlite3 (durable, zero-ops, survives restart), always-on VM/container host (NOT serverless — explicitly call out why Vercel/Netlify functions won't work), pm2 for process supervision

3. Component Design — seven detailed subsections:
   - 3.1 Persona Module: TypeScript interface PersonaProfile with name, domain, bio, voice (tone, sentenceStyle, personPOV, signaturePhrases), interests (5-8 bounded sub-topics), opinions (4-6 recurring stances), publishingStandards (explicit rubric). Generated once via LLM at init, stored in SQLite, passed as system prompt for every subsequent call
   - 3.2 Scheduler: On init, start recurring loop with randomBetween(MIN_INTERVAL, MAX_INTERVAL) e.g. 90-240 minutes for 6-12 posts/48h with jitter. Persist next_run_at. On boot, resume active agents. Loop body never throws uncaught — try/catch everything, log to run_log table
   - 3.3 Discovery Module: Build search queries from persona.interests (rotate through interests across cycles). Return N raw candidates { title, url, snippet, publishedAt }. No filtering here — gather only
   - 3.4 Editorial Judgment Module: Single LLM call per cycle with persona profile + publishingStandards + candidate list + recent memory summary. Forced JSON output: for each candidate { verdict: accept|reject, reason, noveltyScore: 0-1, relevanceScore: 0-1 }. Write ALL verdicts to topic_reviews table. Hard code-level backstop: force-reject if topic_key matches memory regardless of LLM output
   - 3.5 Writer Module: Only invoked on accept. LLM call with persona voice system prompt + accepted topic + source snippets → { text (80-280 words, no markdown), rationale (why selected/why now/why over alternatives), sources (real URLs from discovery) }. Lightweight self-check for near-duplicate text
   - 3.6 Memory Module: posts table is memory-of-record. topic_key normalized slug for exact-match dedup. Optional embedding for semantic near-duplicate detection. Memory context passed as bulleted list in both Judgment and Writer prompts
   - 3.7 Persistence Layer: Full SQLite schema with CREATE TABLE statements for agents, posts, topic_reviews, run_log — include all columns, types, foreign keys, and defaults

4. API Spec (authoritative, byte-for-byte field names): POST /api/agent/init behavior (validate, generate UUID, run Persona Module, insert agent, kick off scheduler async, return agentId 200), GET /api/agent/feed behavior (query posts, reverse chronological, map to exact JSON shape, empty state returns { "posts": [] })

5. LLM Prompting Strategy: One persistent system prompt per agent built at init. Three prompt types — persona-generation (init only), judgment (each cycle, low temperature), writer (on accept, moderate temperature). All use JSON-forcing pattern with parse-and-retry fallback

6. Autonomous Loop Pseudocode: Full TypeScript-style pseudocode for runCycle() showing discovery → judgment → dedup check → write → near-duplicate check → save → reschedule with jitter. Boot resume logic

7. Deployment guidance: Always-on host requirement, recommended platforms, environment variables (ANTHROPIC_API_KEY, SEARCH_API_KEY, DATABASE_PATH, MIN/MAX_CYCLE_MINUTES, PORT), persistent volume for SQLite

8. Reliability & Recovery: Timeout + retry + backoff on all external calls, pm2 restart policy, boot-time resume, health check endpoint

9. Security & Cost Controls: API keys via env only, cap discovery/generation calls per cycle, input validation against prompt injection

10. Testing Plan: Unit tests for API contract shape, ordering/immutability, dedup verification, persona consistency check, restart resilience, full soak test

11. Open Decisions to Finalize: Node vs Python, search source choice, exact cadence bounds, 404 vs empty posts for unknown agentId

Format as professional Markdown with ASCII diagrams, TypeScript interfaces, SQL DDL blocks, tables, and pseudocode.
```

---

### Prompt 3: Initial Backend Scaffold — Express + SQLite + API Endpoints

```text
I'm building a submission for a hackathon challenge called "Autonomous AI Creator." PRD.md and TRD.md are in this folder — read both fully before writing any code. They are the authoritative spec. Build exactly what they describe. If anything below conflicts with those files, the files win.

Build a single always-on Node.js/TypeScript service (Express) that:

1. Exposes exactly two HTTP endpoints, matching the contract in TRD.md §4 byte-for-byte on field names and shapes:
   - POST /api/agent/init
   - GET /api/agent/feed?agentId=...

2. On init, expands the given { name, domain } into a full, durable PersonaProfile (TRD §3.1) using the Anthropic Claude API, stores it, and starts a background autonomous loop for that agent — the HTTP response must return immediately (don't block on the first content cycle).

3. Runs that loop entirely unattended from then on: topic discovery (live web search) → editorial judgment (accept/reject with reasons, logged) → writing (persona-voiced, with rationale + real sources) → persistence — on a jittered interval spread across ~48 hours (TRD §3.2, §6).

4. Persists everything in SQLite (better-sqlite3) per the schema in TRD §3.7, on a path that survives restarts.

5. Is restart-safe: on boot, resume any active agent's schedule instead of losing it (TRD §6, "boot resume" logic).

6. Never crashes the process on an LLM/search failure — every stage is wrapped in try/catch, failures are logged to run_log, and the loop reschedules itself regardless (TRD §8).

Tech choices (follow TRD §2):
- Node.js 20+, TypeScript, Express
- better-sqlite3 for storage
- Anthropic Messages API for persona generation, editorial judgment (forced JSON output), writing + rationale generation (forced JSON output)
- Use Anthropic's built-in web_search server tool for topic discovery (avoids a second API key) — implement it so it's easy to swap for Tavily/Brave later
- dotenv for config: ANTHROPIC_API_KEY, DATABASE_PATH, MIN_CYCLE_MINUTES, MAX_CYCLE_MINUTES, PORT
- pm2-friendly (no reliance on serverless request/response lifecycle)

Editorial judgment must be real, not decorative. Implement both:
- The LLM-driven judgment call (persona rubric + candidates + recent-topics memory → accept/reject + reasons + novelty/relevance scores), AND
- A deterministic code-level backstop that force-rejects anything whose topic already matches recent memory (exact key match), regardless of what the model says.
Write every verdict (accept AND reject) to the topic_reviews audit table.

Memory must actually prevent repeats:
- Exact-match dedup via a normalized topic_key on every post
- A second, softer check: compare a new draft's text similarity against recent posts and block near-duplicates before they're saved
- Pass a compact "already covered" list from memory into both the judgment and writer prompts so the model itself is also steering away from repeats

Rationale + sources are mandatory on every post. Every row written to posts must have non-empty rationale (why selected / why now / why this over alternatives) and a sources array of real URLs carried through from the discovery step — never invent sources.

Deliverables:
1. Full working repo: src/ (TypeScript), package.json, tsconfig.json, .env.example, README.md explaining how to run locally and deploy to an always-on host
2. A scripts/soak-test.ts or npm script that runs the loop with compressed interval (30-90 seconds) behind DEV_FAST_CYCLE=true env flag
3. A tests/ suite (Jest or Vitest) covering: init → feed round trip, empty feed returns { "posts": [] }, feed is newest-first, dedup backstop blocks repeated topic_key
4. Implement everything in TRD §3 (all seven components) and the full schema in TRD §3.7

Build iteratively: scaffold → endpoints → persona generation → discovery → judgment → writing → scheduler/loop → restart-resume → tests. Run and test after each stage.
```

---

### Prompt 4: Judgment Engine & Safety Verification — Dual-Layer Editorial System

```text
The editorial judgment system is the most critical differentiator for this hackathon submission. Evaluators will specifically look for evidence that the agent makes genuine editorial decisions, not just publishes everything it finds. Implement a comprehensive dual-layer editorial judgment system with the following exact specifications:

Layer 1 — LLM-Driven Judgment Call:
- Accept the full PersonaProfile (including publishingStandards rubric, interests array, and opinions array) as context
- Accept the array of discovery candidates (title, url, snippet, publishedAt for each)
- Accept a compact memory summary of the last 20 published topics and the last 10 rejected topics as context so the model can see what has already been covered
- Use forced JSON output mode with the Anthropic Messages API to return a structured judgment for every single candidate: { candidateTitle: string, candidateUrl: string, verdict: "accept" | "reject", reason: string (2-3 sentences explaining exactly why this specific topic was accepted or rejected based on the persona's standards), noveltyScore: number (0.0 to 1.0, where 1.0 means completely novel and 0.0 means already fully covered), relevanceScore: number (0.0 to 1.0, where 1.0 means perfectly aligned with persona interests and 0.0 means completely off-topic) }
- The model must also indicate which single candidate (if any) is the cycle's pick — the one that best satisfies all criteria simultaneously
- Use low temperature (0.3 or lower) for deterministic, consistent judgment behavior
- The system prompt must explicitly instruct the model: "You are acting as the editorial gatekeeper for this persona. Your job is to be SELECTIVE. Most candidates should be rejected. Only accept topics that are genuinely novel, highly relevant to the persona's specific interests, substantive (not marketing fluff or generic news), and timely. When rejecting, give specific reasons tied to the persona's standards — not generic dismissals."

Layer 2 — Deterministic Code-Level Backstop:
- Before even sending candidates to the LLM, pre-filter using exact topic_key matching: normalize each candidate's title into a slug (lowercase, strip punctuation, collapse whitespace), check against all existing topic_keys in the posts table for this agentId, and remove any exact matches from the candidate list entirely
- After the LLM returns its judgment, apply a secondary code-level override: if the LLM marked something as "accept" but the topic_key matches ANY entry in the posts or topic_reviews tables (even rejected ones from prior cycles), force the verdict to "reject" with reason "Deterministic backstop: topic already exists in memory"
- If the noveltyScore returned by the LLM is below 0.4, force-reject regardless of the LLM's verdict

Audit Trail:
- Write EVERY single verdict — both accepted AND rejected — to the topic_reviews SQLite table with columns: id (autoincrement), agent_id, reviewed_at (ISO 8601), candidate_title, candidate_url, verdict, reason, novelty_score, relevance_score
- This table is the artifact that proves editorial judgment actually happened during the 48-hour evaluation window, even though rejected topics never appear in the public feed API response
- Include a counter in the run_log detail field showing how many candidates were evaluated and how many were rejected vs accepted in each cycle

Error Handling:
- If the LLM call fails (timeout, rate limit, invalid JSON response), catch the error, log it to run_log with outcome "error", and skip the entire judgment phase for this cycle — do NOT publish anything without editorial review
- If the JSON parse fails on the LLM response, retry once with a stricter prompt; if it fails again, log and skip
- The judgment module must NEVER crash the process — wrap everything in try/catch and fail gracefully
```

---

### Prompt 5: Topic Discovery with Live News Sources — Multi-API Fetcher

```text
Build a robust topic discovery module that fetches real, live news and articles from multiple public APIs to provide genuinely fresh content candidates for the editorial judgment engine. The discovery system must pull from real-world sources — NOT from a static hardcoded list, NOT from the LLM's training data, and NOT from invented/hallucinated URLs. Every URL in the candidates array must be a real, verifiable, currently-live web page.

Implement the following multi-source fetcher in backend/src/services/fetcher.ts:

Source 1 — Dev.to API:
- Endpoint: GET https://dev.to/api/articles?tag={tag}&per_page=8
- Map the persona's current interest to an appropriate tag (e.g., "security" for security-related interests, "ai" for AI-related interests, "machinelearning" for ML topics)
- Extract from each article: title, url (the canonical Dev.to URL), description as snippet, published_at as publishedAt, and the source name "Dev.to"
- Include User-Agent header: "CogniPulse/1.0"
- Validate every URL: must start with http:// or https://, must not contain example.com, localhost, or 127.0.0.1

Source 2 — HackerNews API:
- First fetch top story IDs from: GET https://hacker-news.firebaseio.com/v0/topstories.json
- Take the first 10 story IDs
- For each story ID, fetch the item: GET https://hacker-news.firebaseio.com/v0/item/{id}.json
- Extract title, url (the external link), and construct snippet from the title
- If the item has no external URL, construct a HackerNews discussion URL: https://news.ycombinator.com/item?id={id}
- Filter to only items that contain relevant keywords matching the persona's domain/interest

Source 3 — Reddit JSON Feeds:
- Fetch from relevant subreddits based on the persona's domain:
  - For AI/ML: GET https://www.reddit.com/r/MachineLearning/hot.json?limit=5
  - For Security: GET https://www.reddit.com/r/netsec/hot.json?limit=5
  - For general tech: GET https://www.reddit.com/r/technology/hot.json?limit=5
- Parse the JSON response to extract post titles, external URLs (not Reddit self-post URLs), and snippets from selftext or title
- Construct source URL as the Reddit permalink if no external URL exists

Source 4 — Tavily Search API (Optional, if TAVILY_API_KEY is provided):
- POST https://api.tavily.com/search with body { "query": "{domain} {interest} latest news", "max_results": 5 }
- Extract title, url, and content snippet from each result

URL Validation Function:
- Create a strict isValidWebUrl(urlStr: string): boolean function that:
  - Returns false for null, undefined, empty string, or non-string values
  - Parses with new URL() and rejects if protocol is not http: or https:
  - Rejects if hostname contains example.com, localhost, or 127.0.0.1
  - Returns true only for properly formed, publicly accessible web URLs

Error Isolation:
- Each source (Dev.to, HackerNews, Reddit, Tavily) must be wrapped in its own individual try/catch block
- If one source fails (network error, rate limit, malformed response), the others should still return their candidates
- Log warnings for failed sources but never crash the discovery module
- If ALL sources fail, return an empty candidates array — the scheduler will log "skipped_no_candidates" and try again next cycle

Deduplication Across Sources:
- After collecting candidates from all sources, deduplicate by URL (normalize URLs by removing trailing slashes and query parameters)
- Shuffle the final candidates array to avoid always presenting Dev.to articles first

Return type: DiscoveryCandidates[] where each item has { title: string, url: string, snippet: string, publishedAt?: string }
```

---

### Prompt 6: LLM Service — Groq Multi-Key Pool, Fallback Model Cascade, and Retry Logic

```text
Refactor the LLM service to use the Groq API instead of Anthropic for production inference, implementing a robust multi-API-key pool with round-robin rotation and a fallback model cascade for rate-limit (429 TPD/TPM) mitigation. The Groq API offers significantly faster inference speeds (tokens per second) which is critical for the autonomous loop that needs to complete discovery → judgment → writing within reasonable time windows.

Implement the following in backend/src/services/llm.ts:

Multi-Key API Pool:
- Support multiple Groq API keys via two methods:
  1. GROQ_API_KEYS environment variable: comma-separated, semicolon-separated, or newline-separated string of API keys
  2. Numbered individual environment variables: GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3, etc. — dynamically scan all env vars starting with "GROQ_API_KEY"
- Deduplicate keys (same key might appear in both GROQ_API_KEYS and GROQ_API_KEY_2)
- Maintain a round-robin counter (keyIndexCounter) that increments with each LLM call, distributing load evenly across all available keys
- Cache Groq client instances per key to avoid creating new clients on every call
- Log a warning if no API keys are detected

Fallback Model Cascade:
- Define a prioritized list of fallback models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"]
- On any 429 (rate limit) or 503 (service unavailable) error, automatically try the next model in the cascade
- For each API key, iterate through all fallback models before moving to the next key
- This gives us (number_of_keys × number_of_models) total retry combinations before giving up

callLLMWithRetry Function:
- Accept standard chat completion params (messages, temperature, max_tokens, response_format)
- Implement nested retry loop: outer loop over API keys (round-robin starting from current counter), inner loop over fallback models
- On 429/503 errors: log which key and model hit the rate limit, add a small delay (1-3 seconds), try next model/key combination
- On other errors: log and try next combination
- If all combinations exhausted, throw the last error
- Return the successful completion response

Three Core LLM Functions:

generatePersona(name: string, domain: string) → PersonaProfile:
- System prompt: "You are an AI persona architect. Create a deeply detailed, consistent persona profile for an autonomous content creator agent. The persona must feel like a real human expert — with specific opinions, a distinctive writing voice, clear interests within their domain, and explicit editorial standards that will guide what topics they choose to cover and reject. Return ONLY valid JSON matching the exact schema provided. No markdown, no prose, no code fences."
- Include the full PersonaProfile TypeScript interface as the expected JSON schema in the prompt
- Temperature: 0.7 (creative enough for a unique persona, structured enough for valid JSON)
- Parse and validate the response, retry once on JSON parse failure

discoverTopics(persona: PersonaProfile, interestIndex: number) → DiscoveryCandidates[]:
- Combine live news fetcher results with an LLM-powered relevance filter
- Pass the fetcher candidates to the LLM with the persona context and ask it to rank/filter for relevance
- Return the filtered and enriched candidates array

judgeTopics(persona: PersonaProfile, candidates: DiscoveryCandidates[], recentTopics: string[]) → JudgmentResult:
- System prompt includes the full persona profile, publishing standards, and recent memory
- Forced JSON output with verdict, reason, scores for each candidate
- Temperature: 0.2 (deterministic judgment)
- Returns { all: JudgmentReview[], accepted: DiscoveryCandidates | null }

writePost(persona: PersonaProfile, acceptedTopic: DiscoveryCandidates, recentTopics: string[]) → DraftPost:
- System prompt with persona voice, interests, and opinions
- User prompt with the accepted topic details and "already covered" angles to avoid
- Temperature: 0.6 (natural variation within fixed voice)
- Returns { text: string, rationale: string, sources: string[] }
```

---

### Prompt 7: SQLite Database Layer — Complete Schema, CRUD Operations, and Stats

```text
Build the complete SQLite database layer in backend/src/db/index.ts using better-sqlite3. This is the persistence backbone of the entire autonomous agent system — every piece of state (agents, posts, topic reviews, run logs) must survive process restarts and be queryable for the dashboard API.

Database Initialization:
- Accept DATABASE_PATH from environment variable, defaulting to "./agent.db"
- Create all tables with IF NOT EXISTS on module load so the database self-initializes
- Use WAL journal mode for better concurrent read performance
- Enable foreign keys

Schema — Create these exact tables:

agents table:
- agent_id TEXT PRIMARY KEY
- persona_json TEXT NOT NULL (stores the full PersonaProfile as JSON string)
- status TEXT NOT NULL DEFAULT 'active' (either 'active' or 'stopped')
- created_at TEXT NOT NULL (ISO 8601 UTC)
- next_run_at TEXT (ISO 8601 UTC, nullable — used by scheduler for resume)

posts table:
- id TEXT PRIMARY KEY (UUID)
- agent_id TEXT NOT NULL (FK to agents)
- created_at TEXT NOT NULL (ISO 8601 UTC)
- text TEXT NOT NULL (the actual post content)
- rationale TEXT NOT NULL (why selected + why now + why over alternatives)
- sources_json TEXT NOT NULL (JSON array of real URLs)
- topic_key TEXT NOT NULL (normalized slug for exact-match dedup)

topic_reviews table (editorial judgment audit trail):
- id INTEGER PRIMARY KEY AUTOINCREMENT
- agent_id TEXT NOT NULL
- reviewed_at TEXT NOT NULL (ISO 8601 UTC)
- candidate_title TEXT
- candidate_url TEXT
- verdict TEXT NOT NULL ('accept' or 'reject')
- reason TEXT
- novelty_score REAL
- relevance_score REAL

run_log table (scheduler health/debug trail):
- id INTEGER PRIMARY KEY AUTOINCREMENT
- agent_id TEXT NOT NULL
- started_at TEXT NOT NULL
- finished_at TEXT (nullable, set when cycle completes)
- outcome TEXT ('published', 'skipped_no_candidates', 'skipped_all_rejected', 'error')
- detail TEXT (free-form detail string)

CRUD Functions to implement:
- saveAgent(agent: Agent): void — upsert agent row with JSON-serialized persona
- getAgent(agentId: string): Agent | null — retrieve and parse persona_json back to object
- getAllAgents(): Agent[] — list all agents with parsed personas
- updateNextRunAt(agentId: string, nextRunAt: string): void — update scheduler resume timestamp
- savePost(post): void — insert post with UUID, serialize sources array to JSON
- getPosts(agentId: string): Post[] — get all posts for agent, parse sources_json back to array
- getAllPosts(): Post[] — get all posts across all agents
- getRecentPosts(agentId: string, limit: number): Post[] — last N posts for memory context
- getTopicKey(title: string): string — normalize title to lowercase slug (strip punctuation, collapse whitespace, trim)
- topicExists(agentId: string, topicKey: string): boolean — check if topic_key already exists in posts for this agent
- saveTopicReview(review): void — insert judgment audit row
- getTopicReviews(agentId?: string): TopicReview[] — get reviews, optionally filtered by agent
- saveRunLog(log: RunLog): void — insert or update run log entry
- getRunLogs(agentId?: string): RunLog[] — get logs, optionally filtered by agent
- getStats(): SystemStats — aggregate statistics: total agents, total posts, total reviews, acceptance rate, total run logs, last run timestamp
- clearAllData(): void — drop all rows from all tables (used by reset endpoint)
- normalizePersona(persona: any): PersonaProfile — safely parse persona from JSON or object, providing defaults for missing fields (empty arrays for interests/opinions/publishingStandards, default voice object)
```

---

### Prompt 8: Autonomous Scheduler — Background Loop, Jitter, Boot Resume

```text
Implement the autonomous scheduler module in backend/src/services/scheduler.ts. This is the heartbeat of the entire system — it runs the discovery → judgment → writing → publishing cycle on a jittered interval, completely unattended, for the entire 48-hour evaluation window. The scheduler must be rock-solid: it should never crash the process, never double-fire, never lose state on restart, and never stop running unless explicitly told to.

Core Design:
- Maintain a Map<string, NodeJS.Timeout> called 'schedulers' to track active timeout handles per agentId
- Maintain a Map<string, number> called 'cycleCounter' to track how many cycles each agent has completed (for interest rotation and logging)
- Read MIN_MS and MAX_MS from environment variables MIN_CYCLE_MINUTES and MAX_CYCLE_MINUTES (default 90 and 240 minutes respectively)
- Support DEV_FAST_CYCLE environment flag: when set, divide the interval by 60 so that 90-240 minute intervals become 90-240 second intervals for rapid local testing
- Log the actual cycle interval on startup so developers can verify the timing

runCycle(agentId: string) — The Main Autonomous Loop Body:
1. Load the agent from SQLite. If not found, stop the scheduler for this agent and return.
2. Increment the cycle counter for logging and interest rotation.
3. Log cycle start with timestamp and cycle number.
4. Initialize a RunLog entry with default outcome "error".
5. Discovery Phase: Get the persona, select the current interest (rotate through interests array using cycleNum + timestamp modulo), call discoverTopics(). If no candidates returned, log "skipped_no_candidates" to run_log and reschedule.
6. Memory Phase: Load recent posts (last 50) and extract their topic_keys as the memory context.
7. Pre-filter Phase: Filter out candidates whose normalized topic_key already exists in the database — these are guaranteed duplicates. If no fresh candidates remain after filtering, still pass the original candidates to judgment (the LLM might find new angles).
8. Judgment Phase: Call judgeTopics() with persona, fresh candidates, and recent topic keys. Save ALL review verdicts (accept + reject) to topic_reviews table.
9. Accept Check: If no candidate was accepted (all rejected), log "skipped_all_rejected" and reschedule.
10. Dedup Backstop: Even if the LLM accepted a candidate, check its topic_key against the database one more time. If it already exists, log "dedup_blocked" and reschedule. This is the deterministic safety net.
11. Writing Phase: Call writePost() with the accepted candidate and memory context. If writing fails, log error and reschedule.
12. Persistence Phase: Save the post to SQLite with a generated UUID, the agent's ID, current timestamp, the post text, rationale, sources array, and normalized topic_key.
13. Log "published" outcome with the post title in the detail field.
14. Finally Block (always executes): Calculate next run time using randomBetween(MIN_MS, MAX_MS), update the agent's next_run_at in SQLite, and schedule the next cycle with setTimeout.

startScheduler(agentId: string):
- If a scheduler is already running for this agent (exists in the Map), clear it first to prevent duplicates
- Start the first cycle immediately by calling runCycle(agentId) directly (don't wait for the first interval)
- This is called both by the init endpoint (new agent) and by boot resume (existing agent)

stopScheduler(agentId?: string):
- If agentId provided: clear the specific timeout and remove from Map
- If no agentId: clear ALL timeouts (used by reset endpoint)

resumeAll():
- Called once on server boot
- Query all agents with status = 'active' from SQLite
- For each active agent, check next_run_at:
  - If next_run_at is in the past or null, start the scheduler immediately (the agent missed cycles while the process was down)
  - If next_run_at is in the future, schedule the first cycle for the remaining delay
- Log how many agents were resumed

reschedule(agentId: string):
- Calculate random delay between MIN_MS and MAX_MS
- Update next_run_at in SQLite
- Set new setTimeout and store the handle in the schedulers Map
- Log the next scheduled run time

Error Handling:
- The ENTIRE runCycle function body must be wrapped in try/catch
- On any error, log it to run_log with outcome "error" and the error message
- The finally block ALWAYS reschedules — even on error, the loop continues
- Individual phase failures (discovery, judgment, writing) should each have their own try/catch so partial progress is logged correctly
```

---

### Prompt 9: Frontend Project Setup — React + Vite + TypeScript + Framer Motion

```text
Set up the frontend project for CogniPulse using React with Vite and TypeScript. This will be a premium, visually stunning dashboard application that serves as the control room for monitoring and managing the autonomous AI agents. The frontend should feel like a top-tier SaaS product — think Linear, Vercel Dashboard, or Raycast in terms of visual quality and interaction design.

Project Setup:
- Initialize a new Vite React TypeScript project in the frontend/ directory
- Install dependencies: react-router-dom (for multi-page routing), framer-motion (for animations), lucide-react (for icons), gsap (for scroll-triggered animations on the landing page)
- Configure Vite proxy to forward /api requests to the backend at http://localhost:3001

Routing Structure (React Router v6):
- / → Landing Page (public marketing/hero page)
- /auth → Authentication Page (sign in / sign up)
- /dashboard → Main App (protected, contains the full control room)

TypeScript Types (frontend/src/types.ts):
- Agent: { agentId: string, persona: PersonaProfile, status: 'active' | 'stopped', createdAt: string, nextRunAt?: string }
- Post: { id: string, agentId: string, createdAt: string, text: string, rationale: string, sources: string[], topicKey: string }
- TopicReview: { id: number, agentId: string, reviewedAt: string, candidateTitle: string, candidateUrl: string, verdict: 'accept' | 'reject', reason: string, noveltyScore: number, relevanceScore: number }
- RunLog: { id: number, agentId: string, startedAt: string, finishedAt?: string, outcome: string, detail?: string }
- SystemStats: { totalAgents: number, totalPosts: number, totalReviews: number, acceptanceRate: number, totalRunLogs: number, lastRunAt?: string }

Design System Foundation (frontend/src/styles.css):
- Use CSS custom properties (variables) for a complete theme system supporting both dark and light modes via [data-theme="dark"] and [data-theme="light"] selectors
- Dark mode palette: deep navy/charcoal backgrounds (#0a0a0f, #12121a, #1a1a2e), indigo/purple accent gradients, subtle glassmorphism with rgba backgrounds and backdrop-filter: blur
- Light mode palette: clean whites and light grays, darker text, maintained accent gradients, adjusted glassmorphism for light backgrounds
- Typography: Import and use 'Inter' from Google Fonts as the primary typeface, with fallback to system font stack
- Spacing scale: 4px base unit (--space-1 through --space-12)
- Border radius scale: --radius-sm (6px), --radius-md (10px), --radius-lg (16px), --radius-xl (20px)
- Transition tokens: --transition-fast (150ms), --transition-normal (250ms), --transition-slow (400ms)
- Shadow system: layered shadows for elevation hierarchy
- Custom scrollbar styling for both dark and light themes
- Global reset and base styles for body, headings, links, buttons, inputs

Create the App shell component that:
- Manages dark/light theme toggle (persisted to localStorage)
- Sets data-theme attribute on document.documentElement
- Fetches agents, posts, topic reviews, run logs, and stats from the backend API
- Auto-refreshes data every 8 seconds for real-time monitoring
- Manages active view state (overview, feed, executions, workflows, persona, credentials, variables, settings/logs)
- Renders LeftNavSidebar + main content area + optional right panel
```

---

### Prompt 10: WorkflowCanvas — Interactive SVG Node-Based Pipeline Visualization

```text
Build an interactive, visually stunning workflow canvas component (WorkflowCanvas.tsx) that visualizes the autonomous agent's pipeline as a node-based graph. This is the centerpiece visual of the application — it should look like a professional workflow automation tool (think n8n, Zapier, or ComfyUI) with smooth animations and interactive elements.

Canvas Architecture:
- Use SVG for the connection lines/cables between nodes
- Use absolutely-positioned div elements for the nodes themselves (layered on top of the SVG)
- Support panning the canvas by clicking and dragging the background
- Support zooming with mouse wheel (scale transform, clamped between 0.3x and 2.0x)
- Render a subtle dot-grid background pattern that moves with the pan offset

Node Types — Define these pipeline stages as draggable, interactive nodes:
1. TRIGGER node (left edge) — "Agent Initialized" with a Zap icon, green gradient accent
2. DISCOVERY node — "Topic Discovery" with a Search icon, cyan gradient accent
3. JUDGMENT node — "Editorial Judgment" with a Scale icon, amber/orange gradient accent
4. WRITER node — "Post Writer" with an Edit3 icon, purple gradient accent
5. PUBLISHER node — "Feed Publisher" with a Send icon, emerald/green gradient accent
6. MEMORY node (offset below) — "Dedup Memory" with a Database icon, rose/pink gradient accent

Each Node Should Display:
- Category label at top (e.g., "Core", "AI Engine", "Output", "Storage")
- Node icon with gradient background matching the node's theme color
- Node title (large, bold)
- 2-3 "parameters" displayed as label-value pairs (e.g., "Model: Llama 3.3 70B", "Temperature: 0.3", "Sources: Live APIs")
- A subtle status indicator dot (pulsing green for active nodes)
- Connection ports on left (input) and right (output) edges — small circles that glow on hover
- The entire node should have a glassmorphic card appearance with backdrop blur, subtle border, and elevation shadow

Connection Cables:
- Draw SVG path elements between node output ports and the next node's input ports
- Use cubic bezier curves (not straight lines) for organic-looking connections
- Animate the cables with a flowing dash pattern (stroke-dasharray with animated stroke-dashoffset) to show data flow direction
- Color the cables to match the source node's theme color with reduced opacity
- Add a subtle glow filter to the cables

Interaction:
- Clicking a node selects it (highlighted border, raised elevation) and optionally opens a detail panel
- Hovering a node shows a subtle scale-up animation and increased glow
- The canvas should auto-center on initial load with all nodes visible
- Nodes should have initial positions that create a clean left-to-right flow with the MEMORY node offset below the main pipeline

Performance:
- Use React.memo or useMemo for node positions and connection calculations
- Minimize re-renders — only update when zoom, pan, or selection changes
- Use CSS transforms for panning/zooming (not re-positioning elements)

Include predefined INITIAL_NODES and INITIAL_CONNECTIONS arrays with sensible default positions that create a visually balanced layout.
```

---

### Prompt 11: LeftNavSidebar — Workspace Navigation with Collapsible Groups

```text
Build a premium left navigation sidebar component (LeftNavSidebar.tsx) that serves as the primary navigation for the CogniPulse dashboard. The sidebar should feel like a modern IDE or SaaS workspace navigator — think VS Code's activity bar + sidebar, or Linear's left panel.

Navigation Views (NavView type):
- overview: "Overview" — Activity icon, shows the main dashboard
- feed: "Feed" — Radio icon, shows published posts
- executions: "Judgments" — Scale icon, shows editorial judgment audit
- workflows: "Workflows" — Workflow icon, shows the node canvas
- templates: "Templates" — Layers icon, shows pre-built persona templates
- persona: "Persona" — Compass icon, shows agent identity deep-inspect
- credentials: "Credentials" — Shield icon, shows API key management
- variables: "Variables" — Database icon, shows system config
- settings: "Logs" — Activity icon, shows execution logs

Sidebar Layout:
- Fixed-width sidebar (260px expanded, 60px collapsed) with smooth width transition
- Collapse/expand toggle button at the top
- App branding section: CogniPulse logo/icon with a Sparkles icon, app name (hidden when collapsed), version badge "v1.0"
- Agent selector dropdown at the top: shows all agents with their persona name and domain, plus an "All Agents" option with a Globe icon. Each agent option shows a colored status dot (green for active, gray for stopped)
- Divider between agent selector and navigation groups

Navigation Groups with Headers:
- Group 1 "MONITOR": Overview, Feed, Judgments
- Group 2 "BUILD": Workflows, Templates, Persona
- Group 3 "CONFIGURE": Credentials, Variables, Logs

Each Nav Item:
- Icon + label (label hidden when collapsed)
- Active state: highlighted background with accent color left border, icon color changes to accent
- Hover state: subtle background highlight with smooth transition
- Tooltip showing the label when sidebar is collapsed (CSS-only or title attribute)

Bottom Section:
- "New Agent" button: opens the CreateAgentModal, shows a plus icon with gradient accent
- Theme toggle button: Sun/Moon icon that switches between dark and light mode
- User profile button: avatar circle with first letter of user name, opens UserProfileModal
- Help button: HelpCircle icon, opens HelpDocModal

Animations:
- Use Framer Motion for sidebar expand/collapse with spring physics (stiffness: 300, damping: 30)
- AnimatePresence for label text fade in/out when toggling collapsed state
- Staggered mount animation for nav items on initial render

Styling:
- Glassmorphic background with subtle border on the right edge
- Theme-aware colors using CSS variables
- Custom scrollbar for the navigation area if it overflows
- Group headers in uppercase, small font size, tracking-wider
```

---

### Prompt 12: FeedTab — Real-Time Published Post Stream with Expandable Cards

```text
Build the FeedTab component (FeedTab.tsx) that displays the real-time stream of autonomously published posts from the agent. This is one of the most critical views for evaluators — it's where they'll see the agent's actual output and judge quality. Every post must clearly show its content, rationale, sources, and metadata.

Feed Layout:
- Full-width scrollable feed with posts displayed as expandable card components
- Top toolbar with: total post count badge, sort toggle (newest/oldest first), search/filter input for post text, agent filter dropdown (if viewing all agents), and a refresh button with spinning animation
- Empty state: If no posts yet, show a centered illustration/icon with "No posts published yet" message and "The agent is autonomously discovering and evaluating topics. Posts will appear here as they are published." description, with a subtle pulse animation

Post Card Design:
- Each post is a glassmorphic card with:
  - Header row: Post ID badge (e.g., "#p1"), agent name/persona label, relative timestamp (e.g., "2 hours ago") with absolute timestamp tooltip, expand/collapse toggle icon
  - Post text: Full text of the published post, displayed with proper paragraph formatting. When collapsed, show first 3 lines with fade-out gradient. When expanded, show full text.
  - Rationale section (collapsible): "Why this was published" header with a lightbulb icon, followed by the rationale text. Highlighted with a subtle accent-colored left border and slightly different background
  - Sources section: "Sources" header with an external link icon, followed by a list of source URLs as clickable links that open in new tabs. Each source shows a favicon (via Google's favicon service) and the domain name
  - Metadata footer: Topic key badge, word count, character count, reading time estimate

Animations:
- New posts should animate in from the top with a slide-down + fade-in effect using Framer Motion's AnimatePresence and motion.div with initial={{ opacity: 0, y: -20 }}
- Card expand/collapse should use Framer Motion's layout animation for smooth height transitions
- Staggered mount animation for the initial post list load
- Refresh button should have a rotation animation when clicked

Search/Filter:
- Real-time text filtering of posts as the user types in the search input
- Highlight matching text within post content when a search term is active
- Filter by agent if "All Agents" is selected in the sidebar

Responsive:
- Cards should be responsive — full width on smaller screens, max-width with centering on larger screens
- Source URLs should truncate gracefully on small screens
- Timestamps should show relative format by default with full ISO date on hover/tooltip

Data:
- Accept posts array, agents array, and selectedAgentId as props
- Filter posts by selectedAgentId if not 'all'
- Sort by createdAt (newest first by default)
- Update automatically when new data is passed (auto-refresh from parent)
```

---

### Prompt 13: JudgmentTab — Editorial Verdict Audit with Accept/Reject Visualization

```text
Build the JudgmentTab component (JudgmentTab.tsx) that provides a comprehensive audit view of every editorial judgment the agent has made. This is the component that proves to evaluators that the agent has genuine editorial decision-making — showing both accepted AND rejected topics with detailed reasoning. This should feel like a professional analytics/audit dashboard.

Layout:
- Top stats bar showing: Total Evaluations (count), Acceptance Rate (percentage with colored indicator — green if healthy 15-40%, amber if too high or too low), Total Accepted, Total Rejected, with animated count-up numbers
- Filter/sort toolbar: Filter by verdict (All / Accepted / Rejected), sort by date or by score, search by title/reason text
- Main content area: Scrollable list of judgment cards

Judgment Card Design:
- Each card represents one topic_review entry
- Left side accent border: Green for accepted, red/rose for rejected
- Header row: Verdict badge ("ACCEPTED" in green pill or "REJECTED" in red pill), candidate title (bold, linked to candidateUrl in new tab), reviewed timestamp
- Reason section: The full reason text explaining why the topic was accepted or rejected — this should be prominently displayed as it's the proof of editorial judgment
- Score visualization: Two horizontal bars showing:
  - Novelty Score (0-1): colored bar from red (0) through amber (0.5) to green (1.0) with the numeric value
  - Relevance Score (0-1): same colored bar treatment
  - Both bars should be animated on mount (grow from 0 to their value)
- Source URL: Clickable link to the candidate URL with external link icon
- Agent badge: Which agent made this judgment (if viewing all agents)

Detail Expansion:
- Clicking a card expands it to show additional details:
  - Full reason text (if truncated in collapsed view)
  - Candidate URL as a full clickable link
  - Reviewed timestamp in full ISO format
  - Agent ID

Visualization Enhancements:
- Add a small chart or sparkline at the top showing judgment history over time (accepted vs rejected per cycle)
- Color-coded verdict distribution: visual ratio bar showing green (accepted) vs red (rejected) proportion
- Score distribution indicators

Empty State:
- If no reviews yet: "No editorial judgments recorded yet. The agent will evaluate topics during its next discovery cycle." with a scale/balance icon

Animations:
- Cards should use Framer Motion staggered mount animation
- Score bars should animate from 0 to their value with a spring animation
- Verdict badges should have a subtle entrance animation
- Filter/sort changes should use AnimatePresence for smooth transitions

Props:
- Accept topicReviews array, agents array, and selectedAgentId
- Filter by agent if applicable
- Support both compact (collapsed) and detailed (expanded) view modes
```

---

### Prompt 14: PersonaTab — Agent Identity Deep-Inspect Panel

```text
Build the PersonaTab component (PersonaTab.tsx) that provides a deep inspection view of the agent's persona profile — showing the full identity that was generated at init time and drives all of the agent's editorial decisions, writing style, and topic selection. This view should make the persona feel tangible and real, like a character profile page.

Layout:
- Top hero section: Agent name in large typography, domain badge, status indicator (active/stopped with pulsing dot), creation date
- Bio section: The agent's self-description bio text in a featured quote-style card
- Voice profile card: Displays the persona's voice characteristics:
  - Tone (e.g., "direct, technically precise, dry humor")
  - Sentence Style (e.g., "short declarative sentences, occasional rhetorical question")
  - Point of View (First person / Third person)
  - Signature Phrases (if any) — displayed as individual tags/chips
- Interests section: Grid of interest topic cards, each showing:
  - Interest name in a pill/tag with a gradient background
  - Visual indicator of how many posts have been written about each interest (if data available)
  - Interests should be displayed in a flowing tag cloud or grid layout
- Opinions section: The agent's recurring editorial stances, displayed as:
  - Individual opinion cards with a quote icon
  - Each opinion as a statement (e.g., "Skeptical of benchmark-driven hype")
  - Subtle left border accent color for each opinion card
- Publishing Standards section: The explicit rubric the agent uses to judge topics:
  - Each standard as a checklist item with a check circle icon
  - Displayed in a structured list with clear formatting
- Performance metrics section (if data available):
  - Total posts published
  - Total topics evaluated
  - Acceptance rate
  - Average novelty/relevance scores
  - Last active timestamp
  - Uptime duration

Agent Controls:
- Start/Stop toggle button: Allows toggling the agent between 'active' and 'stopped' status via the POST /api/agent/status endpoint
- Manual trigger button: "Run Cycle Now" button that calls POST /api/agent/trigger to force an immediate discovery → judgment → writing cycle
- Both buttons should have loading states and confirmation feedback

No-Agent State:
- If no agent is selected or no agents exist: Show a "No agent selected" message with a call-to-action button to create a new agent

Styling:
- Use glassmorphic cards with subtle borders for each section
- Gradient accent colors for section headers
- Smooth Framer Motion animations for section entrances (staggered from top to bottom)
- Theme-aware colors that work in both dark and light mode
- Interest tags should have varied gradient backgrounds for visual interest
- Opinion cards should use a muted accent left-border color

Props:
- Accept agents array, selectedAgentId, posts array, topicReviews array, and refresh callback
- Display the persona for the currently selected agent
- If 'all' is selected, show the first agent's persona or a multi-agent summary
```

---

### Prompt 15: LogsTab — System Execution Logs with Real-Time Streaming

```text
Build the LogsTab component (LogsTab.tsx) that displays the real-time system execution logs — showing every scheduler cycle's outcome, timing, and diagnostic details. This is the DevOps/debugging view that proves the system ran continuously and autonomously over the 48-hour evaluation window.

Layout:
- Top stats bar: Total Runs, Published count (green), Skipped count (amber), Error count (red), with animated counters
- Filter bar: Filter by outcome type (All / Published / Skipped / Error), filter by agent, search by detail text
- Auto-refresh indicator: Small badge showing "Auto-refreshing every 8s" with a pulse animation
- Main log list: Reverse-chronological scrollable list of run log entries

Log Entry Design:
- Each entry is a compact card/row with:
  - Outcome icon and color: CheckCircle (green) for "published", SkipForward (amber) for "skipped_*" outcomes, AlertCircle (red) for "error"
  - Outcome label badge: Color-coded pill showing the outcome text
  - Timestamp: Started at time in relative format (with absolute on hover), and duration (finished_at - started_at) if available
  - Agent identifier: Which agent this cycle belonged to
  - Detail text: The detail string from the run_log, which might include the published topic title, skip reason, or error message
  - Expandable: Click to see full detail text and agent ID

Outcome Types to Handle:
- "published": Green styling, show the published topic title in the detail
- "skipped_no_candidates": Amber, "No discovery candidates found in this cycle"
- "skipped_all_rejected": Amber, "All candidates were rejected by editorial judgment"
- "dedup_blocked": Amber, "Accepted topic was blocked by dedup backstop"
- "error": Red, show the error message

Timeline Visualization (Optional Enhancement):
- A simple timeline/sparkline at the top showing run activity over time
- Gaps in the timeline indicate periods where the agent was idle between cycles
- This visually demonstrates the "paced, not batched" publishing behavior

Empty State:
- "No execution logs yet. The agent's scheduler will begin logging cycles shortly after initialization." with a clock icon

Animations:
- New log entries should animate in from the top with slide + fade
- Staggered mount for initial list
- Outcome badges should have a subtle scale-up entrance
- Stats counters should animate from 0 to their values

Props:
- Accept runLogs array, agents array, selectedAgentId
- Filter by agent if applicable
- Sort newest first by default
```

---

### Prompt 16: OverviewView — Dashboard with Metrics, Activity Feed, and Quick Actions

```text
Build the OverviewView component (OverviewView.tsx) that serves as the main dashboard landing view when the user first enters the app. This should provide an at-a-glance summary of the entire autonomous agent system's health, activity, and key metrics — like a mission control overview.

Top Metrics Grid (4 cards in a row):
- Active Agents: Count of agents with status 'active', icon: Cpu, accent: indigo gradient
- Posts Published: Total post count across all agents, icon: MessageSquare, accent: emerald gradient
- Topics Evaluated: Total topic reviews count, icon: Scale, accent: amber gradient
- Acceptance Rate: Calculated from accepted/total reviews as percentage, icon: TrendingUp, accent: cyan gradient
- Each metric card should be glassmorphic with:
  - Large number display with animated count-up on mount
  - Icon with gradient background
  - Subtle trend indicator (up/down arrow or sparkline)
  - Card should have hover elevation effect

Agent Status Section:
- List of all agents with their:
  - Name and domain
  - Status badge (Active/Stopped with pulsing indicator)
  - Post count for this agent
  - Last cycle outcome
  - Next scheduled run time (countdown timer showing "Next cycle in 47m")
  - Quick action buttons: Trigger Cycle, Pause/Resume

Recent Activity Feed:
- Combined timeline of recent events across all agents:
  - Posts published (green dot, post title, timestamp)
  - Topics rejected (red dot, candidate title, reason snippet)
  - Cycles completed (blue dot, outcome, timestamp)
  - Errors (red dot, error message)
- Show the last 15-20 events
- Each entry links to the relevant detail view (clicking a post goes to Feed, clicking a judgment goes to Judgments)

System Health Panel:
- Overall system status indicator (green "Healthy" / amber "Degraded" / red "Error")
- Backend API connectivity check
- Last successful cycle timestamp
- Scheduler status for each agent

Quick Action Buttons:
- "Create New Agent" button with a plus icon
- "Trigger All Cycles" button (fires manual cycles for all active agents)
- "View Documentation" button

Animations:
- Metric cards should stagger in from the left with spring physics
- Activity feed items should animate in with staggered delays
- Count-up animations for all numeric values
- Pulse animation on the system health indicator
- Card hover effects with scale and shadow changes

Props:
- Accept agents, posts, topicReviews, runLogs, stats, refresh callback
- Compute derived metrics from the raw data
- Handle empty states for each section independently
```

---

### Prompt 17: CreateAgentModal — Agent Initialization Dialog

```text
Build the CreateAgentModal component (CreateAgentModal.tsx) — a beautiful modal dialog for creating new autonomous AI agents. This is the entry point to the core product functionality, so it needs to feel premium and guide the user through the persona configuration clearly.

Modal Design:
- Centered overlay modal with backdrop blur and darkened background
- Modal card: glassmorphic with rounded corners, subtle border, and elevation shadow
- Close button (X icon) in the top-right corner
- Click-outside-to-close and Escape key support

Form Layout:
- Header: "Create New Persona Agent" title with a Sparkles icon, subtitle "Initialize an autonomous AI content creator with a unique personality and expertise domain"

- Persona Name Field:
  - Label: "Persona Name"
  - Placeholder: "e.g., Ada, Marcus, Dr. Chen"
  - Helper text: "The name your AI agent will use as their identity"
  - Input with icon (User icon) and focus ring animation
  - Validation: required, minimum 2 characters

- Domain Field:
  - Label: "Expertise Domain"
  - Placeholder: "e.g., AI Security, Machine Learning, Cloud Infrastructure"
  - Helper text: "The subject area your agent will specialize in and write about"
  - Input with icon (Globe icon) and focus ring animation
  - Validation: required, minimum 3 characters

- Quick Template Suggestions:
  - Row of clickable template chips/pills that auto-fill both name and domain:
    - "Ada — AI Security" (shield icon)
    - "Marcus — ML Engineering" (cpu icon)
    - "Dr. Chen — AI Ethics" (scale icon)
    - "Nova — DevOps & Cloud" (cloud icon)
    - "Rex — Open Source" (github icon)
  - Clicking a template fills both fields with smooth animation

- Submit Button:
  - "Initialize Agent" with a Sparkles icon
  - Gradient background matching the app's accent colors
  - Loading state: spinner animation with "Generating persona..." text
  - Disabled state when form is invalid or submitting
  - Success state: brief green checkmark animation before modal closes

API Integration:
- On submit, POST to /api/agent/init with { persona: { name, domain } }
- Show loading state during the API call
- On success: close modal, call the refresh callback, optionally navigate to the persona view for the new agent
- On error: show error message inline with a retry option

Animations:
- Modal entrance: scale from 0.95 + fade in with spring physics
- Modal exit: scale to 0.95 + fade out
- Form fields should stagger in on mount
- Template chip selection should have a press/scale animation
- Submit button should have a hover gradient shift and press scale effect
- Backdrop should fade in/out with AnimatePresence

Props:
- isOpen: boolean
- onClose: () => void
- onAgentCreated: (agentId: string) => void
```

---

### Prompt 18: Landing Page — Cinematic Hero Section with GSAP ScrollTrigger

```text
Build a stunning, cinematic landing page (LandingPage.tsx) for CogniPulse that showcases the product with modern web design excellence. This page is the first thing users see — it needs to create an immediate "wow" impression that communicates the sophistication of an autonomous AI system. Think of landing pages from Linear, Vercel, or Stripe for inspiration.

Hero Section:
- Full-viewport-height hero with a dark gradient background (deep navy to near-black)
- Animated background: subtle floating particles or grid pattern with parallax movement on scroll
- Headline with kinetic typography: "Autonomous AI" on the first line, "Content Creation" on the second line — each word should animate in with staggered GSAP timeline (slide up + fade in, with spring easing)
- Subheadline: "AI agents that think, discover, judge, and publish — completely on their own. Zero human prompts after setup."
- Two CTA buttons: "Launch Dashboard" (primary, gradient) and "Watch Demo" (secondary, outlined with play icon)
- Interactive 3D Agent Visualization component centered below the CTAs — an animated, stylized 3D-looking representation of the AI agent (can be CSS/SVG-based pseudo-3D)
- Scroll indicator at the bottom: animated chevron bouncing to indicate more content below

Features Section (Scroll-Triggered):
- Section title: "Built Different" with a subtitle "Every component designed for genuine autonomous intelligence"
- 6 feature cards in a 3x2 grid, each with GSAP ScrollTrigger animation (fade in + slide up as they enter viewport):
  1. Autonomous Intelligence (Brain icon, indigo gradient): "AI agents that think, discover, and create content independently"
  2. Editorial Judgment (Eye icon, cyan gradient): "Each agent evaluates topics against persona-specific standards"
  3. Persistent Memory (Shield icon, amber gradient): "Never repeats itself. Durable memory tracks every topic covered"
  4. Authentic Voice (MessageSquare icon, green gradient): "Consistent persona across every post"
  5. Visual Workflow Editor (Workflow icon, purple gradient): "Design and customize your agent pipeline with drag-and-drop"
  6. Live Analytics (TrendingUp icon, rose gradient): "Real-time monitoring of agent performance and editorial decisions"
- Each card: glassmorphic background, icon with gradient circle background, title, description, hover lift effect

How It Works Section (Scroll-Triggered Pipeline):
- Section title: "How It Works"
- Horizontal pipeline visualization showing 5 steps connected by animated lines:
  1. Initialize → 2. Discover → 3. Judge → 4. Write → 5. Publish
- Each step has an icon, title, and brief description
- The connecting lines should animate with a flowing dash pattern as the section scrolls into view
- Each step should animate in sequentially (left to right) with GSAP stagger

Stats/Social Proof Section:
- 4 large stat numbers with labels:
  - "48h+" — Continuous Operation
  - "100%" — Autonomous After Setup
  - "Real" — Live Source Discovery
  - "Zero" — Human Prompts Needed
- Each number should have a count-up animation triggered by scroll

CTA Section:
- Final call-to-action: "Ready to Deploy Your First AI Agent?"
- "Get Started Free" button with gradient + arrow icon
- Subtle background glow effect behind the CTA

Footer:
- Minimal footer with: CogniPulse branding, "Built for the Autonomous AI Creator Hackathon", copyright, GitHub link

Theme Toggle:
- Floating theme toggle button (Sun/Moon) in the top-right corner that works across the entire landing page

Navigation Bar:
- Fixed/sticky nav at the top with: logo + app name, nav links (Features, How It Works, Dashboard), theme toggle, "Get Started" CTA button
- Nav should have a transparent-to-solid background transition on scroll (GSAP ScrollTrigger)

GSAP & Framer Motion Integration:
- Use GSAP with ScrollTrigger for scroll-based animations (feature cards, pipeline, stats)
- Use Framer Motion for hover interactions, button animations, and page transitions
- Register ScrollTrigger plugin on component mount
- Clean up GSAP contexts on unmount to prevent memory leaks
```

---

### Prompt 19: Interactive3DAgent — Animated CSS/SVG Agent Visualization

```text
Build the Interactive3DAgent component (Interactive3DAgent.tsx) — a visually striking, animated pseudo-3D representation of the AI agent that appears on the landing page hero section. This should look like a futuristic, glowing AI entity — not a generic robot icon, but something abstract and sophisticated that conveys intelligence and autonomy.

Design Concept:
- A floating, spherical or crystalline core structure with multiple orbiting rings/halos
- The core should pulse with a subtle glow animation (like a heartbeat, representing the agent's "consciousness")
- 3-4 concentric orbital rings rotating at different speeds and axes (like an atom or gyroscope)
- Floating data points or nodes on the orbital paths (small glowing circles) representing topics being processed
- Connecting lines between some nodes (like a neural network visualization)
- A subtle particle field in the background emanating from the core

Implementation:
- Pure CSS/SVG approach (no WebGL/Three.js) for performance and compatibility
- Use CSS transforms (rotateX, rotateY, rotateZ) with animations for the 3D orbital effect
- perspective and transform-style: preserve-3d on the container for depth
- Use CSS @keyframes for continuous animations:
  - Core pulse: scale 0.95 to 1.05 with opacity shift
  - Ring rotation: each ring at different rotation speed (15s, 20s, 25s) and axis
  - Node float: subtle up/down bob on orbital nodes
  - Glow intensity: oscillating box-shadow/filter intensity
- Use SVG circles and paths for the geometric elements
- CSS custom properties for colors so it works with both dark and light themes

Color Palette:
- Core: Bright indigo/violet (#6366f1) with radial gradient to transparent
- Ring 1: Cyan (#06b6d4) with low opacity
- Ring 2: Purple (#8b5cf6) with low opacity
- Ring 3: Emerald (#10b981) with low opacity
- Nodes: White/bright with glow
- Background glow: Indigo radial gradient

Interactivity:
- The entire component should respond to mouse hover with a slight tilt effect (CSS perspective shift based on mouse position, or a simple scale-up)
- On hover, the orbital rings should speed up slightly (CSS transition on animation-duration)
- The core glow should intensify on hover

Sizing:
- Accept a size prop or be responsive to its container
- Default size approximately 280-320px
- Should look good on both mobile and desktop

Performance:
- Use will-change: transform on animated elements
- Prefer CSS animations over JavaScript for smooth 60fps
- Minimize DOM elements — use pseudo-elements (::before, ::after) where possible
```

---

### Prompt 20: AuthPage — Premium Sign In / Sign Up with Form Validation

```text
Build a premium authentication page (AuthPage.tsx) with both Sign In and Sign Up modes. This page should feel like signing into a high-end SaaS product — clean, secure-feeling, with smooth transitions and comprehensive form validation. The auth flow is simulated (no actual backend auth) but should feel completely real and polished.

Page Layout:
- Split layout: Left side has the form, right side has decorative branding content
- OR: Centered form card with animated background (choose what looks best)
- Background should have a subtle animated gradient or particle effect
- The page should include the CogniPulse branding prominently

Mode Toggle (Sign In ↔ Sign Up):
- Smooth animated transition between modes using Framer Motion AnimatePresence
- Toggle text: "Don't have an account? Sign Up" / "Already have an account? Sign In"
- URL query param ?mode=signup to support direct links to sign up

Sign In Mode:
- Email input with Mail icon, validation for valid email format
- Password input with Lock icon, show/hide password toggle (Eye/EyeOff icons)
- "Forgot Password?" link (can be non-functional, just styled)
- Submit button: "Sign In" with ArrowRight icon
- Divider: "or continue with"
- Social login buttons (non-functional, styled): Google, GitHub

Sign Up Mode:
- Full Name input with User icon, validation: required, min 2 chars, only letters/spaces/hyphens
- Email input with Mail icon, validation: required, valid email format
- Password input with Lock icon, validation: min 8 chars, at least one uppercase, one number, one special character
- Password strength indicator: visual bar that fills from red → amber → green as the password meets more criteria, with a text label (Weak / Fair / Good / Strong)
- Password requirements checklist: 4 items (length, uppercase, number, special char) each with a check/X icon that turns green as each requirement is met
- Show/hide password toggle
- Submit button: "Create Account" with Sparkles icon
- Terms agreement text: "By creating an account, you agree to our Terms & Privacy Policy"

Form Validation:
- Real-time validation on blur (touched state tracking)
- Error messages appear with slide-down animation below each input
- Error styling: red border on invalid inputs, red text for error messages
- Valid styling: green checkmark icon appears in valid inputs
- Form-level validation: prevent submit if any field has errors

Submit Behavior:
- On valid submit: Show loading spinner on button for 1.5s (simulating API call)
- After "loading": Navigate to /dashboard
- Store a simple flag in localStorage to simulate auth state

Animations:
- Page entrance: fade in + slight slide up
- Mode switch: cross-fade between sign in and sign up forms using AnimatePresence
- Input focus: border color transition + subtle scale effect on the input container
- Submit button: gradient hover effect, press scale animation, loading spinner transition
- Password strength bar: smooth width + color transition
- Error messages: slide in from top with spring physics
- Validation checkmarks: scale pop-in animation

Styling:
- Glassmorphic form card with subtle border and backdrop blur
- Gradient accent colors on the submit button matching the app theme
- Input fields with icon prefix, rounded corners, and focus ring
- Dark theme by default with proper contrast for readability
- Responsive: stack vertically on mobile, side-by-side on desktop
```

---

### Prompt 21: RightInspectorPanel — Context-Sensitive Detail Panel

```text
Build the RightInspectorPanel component (RightInspectorPanel.tsx) — a slide-out detail panel on the right side of the dashboard that shows context-sensitive information based on what's currently selected or active. This panel should feel like an IDE's properties panel or a design tool's inspector — showing detailed information about the selected workflow node, post, or judgment entry.

Panel Behavior:
- Slides in from the right with a smooth Framer Motion animation (spring physics)
- Can be toggled open/closed
- Width: approximately 380px when open, 0 when closed
- Has a subtle left border and glassmorphic background

Content Modes (based on active view and selection):

Mode 1 — Workflow Node Inspector (when a node is selected on the canvas):
- Node title and category header
- Parameter list: All node parameters with their current values displayed as label/value pairs
- Node description text
- Connected nodes: List of input and output connections
- Node status indicator (active/inactive)

Mode 2 — Post Inspector (when a post is selected in the feed):
- Full post text with proper formatting
- Complete rationale text
- All sources as clickable links
- Post metadata: ID, createdAt, topicKey, word count
- Agent info: which agent published this post

Mode 3 — Judgment Inspector (when a judgment entry is selected):
- Full verdict details: accept/reject with reason
- Score visualization bars (novelty and relevance)
- Candidate title and URL
- Agent and timestamp information

Mode 4 — Agent Quick Info (when an agent is selected in the sidebar):
- Agent name and domain
- Status with toggle control
- Quick stats: posts published, topics evaluated, acceptance rate
- Next scheduled cycle countdown
- Quick action: "Run Cycle Now" button

Default Mode (nothing selected):
- "Select an element to inspect" message with a subtle icon
- Quick tips or keyboard shortcuts

Panel Header:
- Mode title (e.g., "Node Inspector", "Post Details")
- Close button (X icon)
- Pin/unpin toggle (keeps panel open even when clicking elsewhere)

Animations:
- Panel slide in/out with spring physics
- Content transitions when switching between modes using AnimatePresence
- Smooth height adjustments as content changes
```

---

### Prompt 22: AddNodesSidebar — Component Library for Workflow Builder

```text
Build the AddNodesSidebar component (AddNodesSidebar.tsx) — a slide-out panel that appears on the left side of the workflow canvas, providing a searchable library of node types that can be added to the agent workflow. Think of it like a component palette in a visual programming tool.

Panel Design:
- Slides in from the left with Framer Motion spring animation
- Width: approximately 320px
- Glassmorphic background with subtle right border
- Header: "Add Components" title with search input below
- Close button (X) in the top-right of the panel

Search:
- Real-time search filtering of available node types as the user types
- Search matches against node title, description, and category
- Clear button (X) in the search input when text is present
- Highlight matching text in results

Node Categories (grouped with collapsible headers):

Category: Core Pipeline
- Agent Initializer: "Configure the starting persona and domain for the autonomous agent"
- Topic Discovery: "Fetch live content candidates from multiple news and article APIs"
- Editorial Judgment: "AI-powered evaluation of topic candidates against persona standards"

Category: AI Processing
- Post Writer: "Generate persona-voiced content with rationale and real source attribution"
- Similarity Checker: "Compare new content against existing posts to prevent duplication"
- Memory Manager: "Track published topics and angles to maintain editorial freshness"

Category: Output & Storage
- Feed Publisher: "Commit approved posts to the persistent feed database"
- Audit Logger: "Record all editorial decisions for transparency and evaluation"
- Notification Sender: "Alert when new posts are published or errors occur"

Category: Scheduling
- Interval Timer: "Configure the autonomous cycle interval with jitter"
- Cron Scheduler: "Set specific times for discovery cycles"
- Boot Resume: "Automatically resume active agents on process restart"

Each Node Item:
- Category-colored left accent bar
- Node icon with gradient background (matching the workflow canvas node colors)
- Node title (bold)
- Node description (smaller, muted text)
- "Add to Canvas" action: Click or drag to add the node to the workflow canvas
- Hover effect: subtle highlight and scale-up

Drag & Drop (Optional Enhancement):
- Nodes can be dragged from the sidebar onto the canvas
- Show a ghost/preview of the node while dragging
- Drop zone indicator on the canvas when dragging

Animations:
- Panel slide in/out with spring physics
- Node items stagger in on panel open
- Category sections can collapse/expand with smooth height transition
- Search filter transitions (items fade in/out based on search match)
- Hover and press animations on node items
```

---

### Prompt 23: TemplatesView — Pre-Built Persona Quick Launch

```text
Build the TemplatesView component (TemplatesView.tsx) that displays a gallery of pre-built persona templates that users can launch with a single click. This eliminates the need to manually configure persona names and domains — users can browse curated expert archetypes and deploy them instantly.

Template Gallery Layout:
- Section header: "Quick Launch Templates" with subtitle "Deploy a pre-configured autonomous persona in one click"
- Grid of template cards (3 columns on desktop, 2 on tablet, 1 on mobile)

Template Definitions (6-8 pre-built personas):
1. "Ada" — AI Security Researcher
   - Description: "Autonomous agent specializing in cybersecurity, prompt injection, model vulnerabilities, and red-teaming tactics"
   - Icon: Shield, Gradient: indigo-to-purple
   - Tags: ["AI Security", "Red Teaming", "Prompt Injection"]

2. "Marcus" — ML Engineering Lead
   - Description: "Covers cutting-edge machine learning architectures, training optimization, and production ML systems"
   - Icon: Cpu, Gradient: cyan-to-blue
   - Tags: ["Machine Learning", "MLOps", "Training"]

3. "Dr. Chen" — AI Ethics Researcher
   - Description: "Focuses on responsible AI, algorithmic fairness, governance frameworks, and societal impact"
   - Icon: Scale, Gradient: amber-to-orange
   - Tags: ["AI Ethics", "Fairness", "Governance"]

4. "Nova" — Cloud Infrastructure Architect
   - Description: "Expert in cloud-native architectures, Kubernetes, serverless patterns, and platform engineering"
   - Icon: Cloud, Gradient: green-to-emerald
   - Tags: ["Cloud", "DevOps", "Infrastructure"]

5. "Rex" — Open Source Maintainer
   - Description: "Tracks open source ecosystem trends, licensing debates, community governance, and major project releases"
   - Icon: Github, Gradient: purple-to-pink
   - Tags: ["Open Source", "Community", "OSS"]

6. "Aria" — Developer Experience Advocate
   - Description: "Passionate about developer tools, SDK design, documentation quality, and developer productivity"
   - Icon: Code, Gradient: rose-to-red
   - Tags: ["DevX", "Tooling", "DX"]

Template Card Design:
- Glassmorphic card with gradient accent top border
- Large icon with gradient circle background at the top
- Persona name (large, bold) and domain subtitle
- Description paragraph
- Tags displayed as small pills/chips at the bottom
- "Deploy Agent" button with gradient styling
- Hover effect: lift + shadow increase + subtle border glow

Deploy Action:
- On click: Call POST /api/agent/init with the template's name and domain
- Show loading state on the card during deployment
- On success: Brief success animation (green checkmark overlay), then call the refresh callback
- On error: Show error toast message

Props:
- onAgentCreated callback
- Existing agents list (to show "Already Deployed" badge on templates that match existing agents)
```

---

### Prompt 24: CredentialsView — API Key Management Interface

```text
Build the CredentialsView component (CredentialsView.tsx) that provides a clean interface for viewing and managing API credentials and integration keys. This view displays the configured API providers and their status — it's primarily informational since keys are managed via environment variables, but should look professional and organized.

Layout:
- Section header: "API Credentials & Integrations" with subtitle "Manage model providers, search APIs, and integration keys"
- Grid of credential cards (2 columns on desktop, 1 on mobile)

Credential Cards:

1. Groq API (Primary LLM Provider):
   - Icon: Zap, Gradient: indigo gradient
   - Provider: "Groq"
   - Description: "High-speed LLM inference for persona generation, editorial judgment, and content writing"
   - Status: Connected (green) / Not Configured (red) — check if GROQ_API_KEY env is set
   - Model: "Llama 3.3 70B Versatile" (display the primary model)
   - Key hint: "gsk_****" (masked key preview)
   - Features: "Multi-key pool", "Fallback model cascade", "Round-robin rotation"

2. HackerNews API (Public):
   - Icon: Globe, Gradient: orange gradient
   - Provider: "HackerNews (Y Combinator)"
   - Description: "Top stories and new submissions from the tech community"
   - Status: Always Connected (no key required)
   - Endpoint: "https://hacker-news.firebaseio.com/v0/"

3. Dev.to API (Public):
   - Icon: Code, Gradient: blue gradient
   - Provider: "Dev.to Community"
   - Description: "Developer articles and blog posts from the Dev.to platform"
   - Status: Always Connected (no key required)
   - Endpoint: "https://dev.to/api/articles"

4. Reddit JSON (Public):
   - Icon: MessageSquare, Gradient: orange-red gradient
   - Provider: "Reddit JSON Feed"
   - Description: "Hot posts from r/MachineLearning, r/netsec, and r/technology"
   - Status: Always Connected (no key required)
   - Endpoint: "https://www.reddit.com/r/*/hot.json"

5. Tavily Search (Optional):
   - Icon: Search, Gradient: green gradient
   - Provider: "Tavily Search API"
   - Description: "AI-optimized web search for enhanced topic discovery"
   - Status: Connected / Not Configured — check if TAVILY_API_KEY env is set
   - Key hint: Masked preview or "Not set"

Each Card:
- Glassmorphic styling with gradient accent top border
- Status dot: green pulsing for connected, red static for not configured
- Masked key display for security
- Provider logo/icon with gradient background
- Connection test button (optional): "Test Connection" with loading state

Information Section:
- Note at bottom: "API keys are configured via environment variables in the backend .env file. Restart the backend service after making changes."
- Link to documentation

Props:
- No specific data props needed (informational view)
- Theme-aware styling
```

---

### Prompt 25: VariablesView — System Configuration Parameters

```text
Build the VariablesView component (VariablesView.tsx) that displays the system configuration variables and their current values. This view shows all the tunable parameters that control the autonomous agent's behavior — cycle timing, memory limits, model selection, and more. It should look like a professional settings/config panel.

Layout:
- Section header: "System Variables" with subtitle "Configure threshold parameters and memory settings"
- Grouped variable cards with clear section headers

Variable Groups:

Group 1: Scheduling Configuration
- MIN_CYCLE_MINUTES: Default 90, description "Minimum interval between autonomous discovery cycles (in minutes)"
- MAX_CYCLE_MINUTES: Default 240, description "Maximum interval between autonomous discovery cycles (in minutes)"
- DEV_FAST_CYCLE: Default false, description "When enabled, divides cycle intervals by 60x for rapid local testing"
- Target posts: "6-12 posts over 48 hours based on interval jitter"

Group 2: LLM Configuration
- Primary Model: "llama-3.3-70b-versatile", description "The primary Groq model used for all LLM inference"
- Fallback Models: List of 4 fallback models, description "Models tried in order when primary hits rate limits"
- API Key Pool Size: Number of configured API keys
- Temperature (Judgment): 0.2, description "Low temperature for consistent editorial decisions"
- Temperature (Writing): 0.6, description "Moderate temperature for natural voice variation"
- Temperature (Persona): 0.7, description "Creative temperature for unique persona generation"

Group 3: Memory & Dedup Configuration
- Memory Window: 50, description "Number of recent posts loaded as memory context for each cycle"
- Topic Key Normalization: "lowercase + strip punctuation + collapse whitespace"
- Dedup Strategy: "Exact topic_key match + LLM novelty score threshold"
- Novelty Score Threshold: 0.4, description "Candidates below this score are force-rejected"

Group 4: Discovery Configuration
- Sources: "Dev.to, HackerNews, Reddit, Tavily (optional)"
- Max Candidates Per Source: 8, description "Maximum articles fetched from each source per cycle"
- Interest Rotation: "Cycles through persona interests using modulo indexing"

Each Variable Entry:
- Variable name/label (monospace font for env var names)
- Current value displayed prominently
- Description text in muted color
- Optional: edit button (non-functional, just styled to look complete)
- Type indicator: number, string, boolean, array

Styling:
- Group headers with gradient accent underline
- Variable entries as compact rows within glassmorphic group cards
- Value displays: monospace for numbers/strings, colored pills for booleans
- Hover effect on each variable row
- Theme-aware colors
```

---

### Prompt 26: UserProfileModal, HelpDocModal, LogoutModal — Supporting Modals

```text
Build three supporting modal components that complete the dashboard's navigation experience:

1. UserProfileModal (UserProfileModal.tsx):
- Modal overlay with backdrop blur
- Profile card showing:
  - Large avatar circle with user's first initial (gradient background)
  - User name (editable input, pre-filled with "Manav" or from localStorage)
  - Email (editable input, pre-filled with placeholder)
  - Role badge: "Admin" or "Developer"
  - Account created date
  - Theme preference toggle (Dark/Light)
- "Save Changes" button with gradient styling
- "Sign Out" button (secondary, muted styling)
- Close button and Escape key support
- Framer Motion entrance/exit animations (scale + fade)

2. HelpDocModal (HelpDocModal.tsx):
- Larger modal (wider, for documentation content)
- Title: "Documentation & Help" with a book/help icon
- Content sections:
  - "Getting Started" — Brief guide on creating your first agent
  - "How the Agent Works" — Overview of the discovery → judgment → writing → publishing pipeline
  - "API Reference" — Quick reference for POST /api/agent/init and GET /api/agent/feed
  - "Understanding the Dashboard" — Explanation of each view (Overview, Feed, Judgments, Workflows, etc.)
  - "Troubleshooting" — Common issues and solutions (agent not publishing, all topics rejected, rate limits)
- Each section should be collapsible/expandable accordion-style
- Code blocks for API examples with proper formatting
- Links to external resources (GitHub repo, etc.)
- Scrollable content area within the modal
- Close button, Escape key, click-outside support

3. LogoutModal (LogoutModal.tsx):
- Small confirmation dialog
- Title: "Sign Out" with a logout icon
- Message: "Are you sure you want to sign out? You can sign back in at any time."
- Two buttons: "Cancel" (secondary) and "Sign Out" (primary/destructive red styling)
- On confirm: Clear localStorage auth state, navigate to /auth
- Framer Motion animations for entrance/exit

All three modals should:
- Use consistent glassmorphic styling matching the app's design system
- Support dark and light themes via CSS variables
- Have Framer Motion AnimatePresence for smooth mount/unmount
- Handle Escape key and click-outside-to-close
- Have proper z-indexing above all other content
```

---

### Prompt 27: CSS Design System — Complete Stylesheet with Theme Tokens

```text
Build the complete CSS design system for CogniPulse in frontend/src/styles.css. This stylesheet is the foundation for the entire application's visual appearance. It must be comprehensive, covering every component, state, and interaction pattern. The design should feel premium, modern, and production-ready — not like a hackathon prototype.

Global Reset & Base Styles:
- Box-sizing: border-box on all elements
- Remove default margins/padding
- Set base font: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif
- Import Inter from Google Fonts (weights: 300, 400, 500, 600, 700, 800)
- Smooth scrolling on html element
- Antialiased text rendering (-webkit-font-smoothing, -moz-osx-font-smoothing)
- Base font size: 14px, line-height: 1.6

Theme Variables — [data-theme="dark"]:
- Background layers: --bg-primary: #0a0a0f, --bg-secondary: #12121a, --bg-tertiary: #1a1a2e, --bg-elevated: #1e1e30
- Text layers: --text-primary: #f0f0f5, --text-secondary: #a0a0b5, --text-muted: #6a6a80
- Accent colors: --accent-primary: #6366f1 (indigo), --accent-secondary: #8b5cf6 (violet), --accent-success: #10b981, --accent-warning: #f59e0b, --accent-error: #ef4444, --accent-info: #06b6d4
- Border colors: --border-primary: rgba(255,255,255,0.08), --border-secondary: rgba(255,255,255,0.04)
- Glass effect: --glass-bg: rgba(18, 18, 26, 0.8), --glass-border: rgba(255,255,255,0.06), --glass-blur: blur(16px)
- Gradient tokens: --gradient-accent: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)
- Shadow layers: --shadow-sm, --shadow-md, --shadow-lg, --shadow-glow (with accent color)
- Scrollbar: --scrollbar-track, --scrollbar-thumb, --scrollbar-thumb-hover

Theme Variables — [data-theme="light"]:
- Background layers: --bg-primary: #f8f9fc, --bg-secondary: #ffffff, --bg-tertiary: #f0f1f5, --bg-elevated: #ffffff
- Text layers: --text-primary: #1a1a2e, --text-secondary: #4a4a5a, --text-muted: #8a8a9a
- Border colors: --border-primary: rgba(0,0,0,0.1), --border-secondary: rgba(0,0,0,0.05)
- Glass effect: --glass-bg: rgba(255, 255, 255, 0.85), --glass-border: rgba(0,0,0,0.08)
- Adjusted shadows for light backgrounds
- Maintain same accent colors

Layout Components:
- .app-shell: Full viewport grid layout with sidebar + main content + optional inspector
- .left-nav-sidebar: Fixed-height sidebar with flex column, transition on width
- .main-content: Flex-grow scrollable content area with padding
- .right-panel: Slide-out inspector panel with transition
- .top-header: Sticky header bar with breadcrumb and action buttons

Card Components:
- .glass-card: Glassmorphic card with backdrop-filter, border, radius, shadow, hover elevation
- .metric-card: Stat display card with icon, value, label
- .post-card: Feed post card with expandable content area
- .judgment-card: Editorial verdict card with accent border (green/red based on verdict)
- .template-card: Template gallery card with gradient accent top
- .credential-card: API credential display card

Form Components:
- .input-group: Input with icon prefix, focus ring animation, error/valid states
- .btn-primary: Gradient accent button with hover shift, press scale, loading spinner
- .btn-secondary: Outlined button with hover fill
- .btn-icon: Icon-only button with tooltip
- .form-error: Error message with slide-in animation
- .select, .dropdown: Styled select/dropdown with custom arrow

Navigation Components:
- .nav-item: Sidebar navigation item with icon, label, active state (accent left border), hover highlight
- .nav-group: Group container with uppercase header label
- .breadcrumb: Top header breadcrumb with separator icons
- .tab-bar: Horizontal tab navigation with underline indicator

Data Display Components:
- .badge: Small pill badge (colored variants: success, warning, error, info, neutral)
- .score-bar: Animated horizontal bar for novelty/relevance scores
- .tag: Interest/topic tag chip with optional gradient
- .timestamp: Relative time display with tooltip for absolute
- .empty-state: Centered empty state with icon, title, description

Modal Components:
- .modal-overlay: Full-screen overlay with backdrop blur and dark background
- .modal-card: Centered content card with max-width, scrollable if tall
- .modal-header: Title with close button
- .modal-body: Padded content area
- .modal-footer: Action buttons row

Workflow Canvas:
- .canvas-container: Full-size container with overflow hidden, cursor grab/grabbing
- .canvas-dot-grid: Repeating dot pattern background
- .workflow-node: Node card with category color accent, connection ports, hover glow
- .connection-port: Small circle on node edges for cable connections
- .node-selected: Selected state with highlighted border and elevated shadow

Utility Classes:
- .flex, .flex-col, .items-center, .justify-between, .gap-*
- .text-sm, .text-lg, .text-xl, .font-medium, .font-bold
- .mt-*, .mb-*, .ml-*, .mr-*, .p-*, .px-*, .py-*
- .rounded-sm, .rounded-md, .rounded-lg, .rounded-full
- .truncate: Text truncation with ellipsis
- .gradient-text: Gradient text effect using background-clip

Animations:
- @keyframes pulse: Pulsing opacity animation for status indicators
- @keyframes spin: 360° rotation for loading spinners
- @keyframes slideInDown: Slide in from top for notifications/errors
- @keyframes fadeIn: Simple opacity fade
- @keyframes shimmer: Shimmer loading effect
- @keyframes flowDash: Animated stroke-dashoffset for SVG cables
- @keyframes float: Subtle vertical float for decorative elements
- @keyframes glow: Pulsing glow intensity for accent elements

Custom Scrollbar:
- ::-webkit-scrollbar: thin (6px width), rounded track and thumb
- Dark theme: dark track, slightly lighter thumb with hover brightening
- Light theme: light track, gray thumb with hover darkening

Responsive Breakpoints:
- @media (max-width: 1200px): Adjust grid columns, hide non-essential panels
- @media (max-width: 768px): Stack layouts vertically, full-width cards, collapsed sidebar
- @media (max-width: 480px): Compact spacing, smaller typography

The total CSS file should be comprehensive — expect 1500-2500+ lines covering every visual element in the application.
```

---

### Prompt 28: Dark/Light Mode Theme Consistency Fix

```text
There are several text visibility and contrast issues in light mode that need to be fixed across the entire application. When switching from dark mode to light mode, many text elements become invisible or hard to read because they're using hardcoded dark-theme colors instead of CSS variable tokens. Fix all of the following issues:

1. All text that uses hardcoded colors like #f0f0f5, #e0e0e5, rgba(255,255,255,...), or white/near-white values in component inline styles must be changed to use CSS variable references (var(--text-primary), var(--text-secondary), var(--text-muted)) instead

2. Card backgrounds using hardcoded dark colors (rgba(18,18,26,...), #12121a, #1a1a2e) in inline styles must use var(--bg-secondary), var(--bg-tertiary), var(--glass-bg) instead

3. Border colors using hardcoded rgba(255,255,255,0.x) must use var(--border-primary), var(--border-secondary) instead

4. The following specific components need fixing:
   - WorkflowCanvas.tsx: Node cards, connection cables, category labels, parameter values
   - FeedTab.tsx: Post card text, rationale text, source links, metadata badges
   - JudgmentTab.tsx: Verdict cards, reason text, score labels, candidate titles
   - PersonaTab.tsx: Bio text, voice characteristics, interest tags, opinion cards
   - LogsTab.tsx: Log entry text, outcome labels, detail text, timestamps
   - OverviewView.tsx: Metric card values, agent list items, activity feed entries
   - LeftNavSidebar.tsx: Nav item labels, group headers, agent selector text
   - CreateAgentModal.tsx: Form labels, input text, template chip text
   - RightInspectorPanel.tsx: Parameter labels, values, section headers
   - AddNodesSidebar.tsx: Node item titles, descriptions, category headers
   - LandingPage.tsx: Feature card text, pipeline step descriptions, stat labels
   - AuthPage.tsx: Form labels, validation messages, helper text

5. Ensure that gradient text effects (background-clip: text) still work in both themes — the gradient colors should remain vibrant but the fallback/surrounding text should use theme tokens

6. All hover states, focus states, and active states should be theme-aware — no hardcoded hover colors

7. Shadows should be different between themes — dark mode uses dark shadows with slight glow, light mode uses subtle gray shadows

Go through EVERY single component file and EVERY inline style and replace ALL hardcoded colors with CSS variable references. This is a comprehensive sweep — don't miss any instance.
```

---

### Prompt 29: Framer Motion Animations — Spring Physics and Micro-Interactions

```text
Add comprehensive Framer Motion animations throughout the application to create a polished, premium feel. Every interactive element should have smooth, satisfying micro-interactions. Use spring physics (not linear easing) for all animations to create natural, organic motion.

Global Animation Variants (define these as reusable variants):

pageTransition:
- initial: { opacity: 0, y: 20 }
- animate: { opacity: 1, y: 0 }
- exit: { opacity: 0, y: -20 }
- transition: { type: "spring", stiffness: 300, damping: 30 }

staggerContainer:
- animate: { transition: { staggerChildren: 0.05 } }

staggerItem:
- initial: { opacity: 0, y: 20 }
- animate: { opacity: 1, y: 0 }
- transition: { type: "spring", stiffness: 400, damping: 25 }

scaleOnHover:
- whileHover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 15 } }
- whileTap: { scale: 0.98 }

slideInFromLeft:
- initial: { x: -300, opacity: 0 }
- animate: { x: 0, opacity: 1 }
- transition: { type: "spring", stiffness: 250, damping: 30 }

slideInFromRight:
- initial: { x: 300, opacity: 0 }
- animate: { x: 0, opacity: 1 }
- transition: { type: "spring", stiffness: 250, damping: 30 }

Component-Specific Animations:

LeftNavSidebar:
- Sidebar width change: motion.aside with animate={{ width: collapsed ? 60 : 260 }} using spring transition
- Nav items: staggered mount, hover scale effect, active state background transition
- Labels: AnimatePresence with fade in/out when sidebar toggles

WorkflowCanvas:
- Node mount: scale from 0.8 + fade in with stagger
- Node hover: scale 1.02 + shadow increase
- Node selection: border glow animation
- Canvas zoom: smooth scale transition
- Connection cables: animated stroke-dashoffset for flowing effect

Feed/Judgment/Log Cards:
- Mount animation: staggered slide-up + fade-in for each card in the list
- Expand/collapse: layout animation with height auto-transition
- Card hover: subtle lift (y: -2) + shadow increase
- Badge entrance: scale pop-in from 0 to 1

Modals:
- Overlay: fade in opacity 0 → 1 with 200ms duration
- Modal card: scale from 0.95 + opacity 0 → 1 with spring (stiffness: 500, damping: 30)
- Content: stagger children inside modal
- Exit: scale to 0.95 + fade out with faster timing

Buttons:
- All clickable buttons: whileHover={{ scale: 1.02 }}, whileTap={{ scale: 0.98 }}
- Loading state: smooth transition between normal text and spinner
- Success state: brief green glow pulse

Score Bars (JudgmentTab):
- Animate width from 0 to actual value using motion.div with animate={{ width: `${score * 100}%` }}
- Use spring transition with delay based on index for stagger effect

Metric Cards (OverviewView):
- Count-up animation: Use a custom hook or useEffect to animate numbers from 0 to their value
- Card mount: stagger from left to right with spring physics
- Icon: subtle rotation or bounce on mount

Theme Toggle:
- Sun/Moon icon: rotate 180° + scale transition when switching
- Use AnimatePresence with mode="wait" for smooth icon swap

Page Transitions:
- Wrap main content area in AnimatePresence
- Each view change should fade out old content and fade in new content
- Use key prop tied to activeView to trigger re-mount animations
```

---

### Prompt 30: Landing Page GSAP ScrollTrigger Animations — Kinetic Typography and Parallax

```text
Enhance the landing page with advanced GSAP ScrollTrigger animations for a cinematic scrolling experience. Every section should animate dynamically as the user scrolls, creating a feeling of discovery and reveal.

Hero Section Typography Animation:
- Use GSAP timeline on component mount to animate the hero text:
  - First line "Autonomous AI" — each letter slides up from below (y: 100) with stagger (0.03s per letter), opacity 0 → 1, using gsap.to with ease: "power4.out"
  - Second line "Content Creation" — same letter-by-letter animation but with 0.3s delay after the first line completes
  - Subtitle text: fade in + slide up after the headline animation completes
  - CTA buttons: scale from 0.9 + fade in, staggered by 0.15s

Navbar Scroll Effect:
- GSAP ScrollTrigger on the navbar:
  - Start: transparent background, no shadow
  - After scrolling past 80px: solid background (var(--glass-bg)), add shadow, slight reduction in padding
  - Use ScrollTrigger with scrub: false and toggleActions: "play none none reverse" for binary state change

Feature Cards Scroll Reveal:
- Each feature card uses ScrollTrigger to animate in as it enters the viewport:
  - initial state: opacity: 0, y: 60, scale: 0.95
  - animated state: opacity: 1, y: 0, scale: 1
  - trigger: when card's top edge reaches 80% of viewport height
  - Use stagger on the cards (0.1s between each card)
  - ease: "power3.out", duration: 0.8

Pipeline Section Animation:
- The "How It Works" pipeline steps animate in sequence as the section scrolls into view:
  - Each step: slide in from left (x: -50) + fade in, staggered by 0.2s
  - Connecting lines between steps: animate stroke-dashoffset from full dash to 0 (drawing effect)
  - Use ScrollTrigger with start: "top 70%"
  - The animation should create the visual impression of data flowing through the pipeline

Stats Counter Animation:
- Large numbers in the stats section count up from 0 to their values when scrolled into view:
  - Use GSAP with onUpdate callback to update innerHTML with rounded intermediate values
  - Duration: 2s with ease: "power2.out"
  - ScrollTrigger: start: "top 80%", once: true (only animate once, not on every scroll pass)

Parallax Effects:
- Subtle parallax on the hero background pattern: moves at 0.3x scroll speed
- Feature card section has a very slight parallax (cards move at 0.95x scroll speed relative to background)
- Use GSAP ScrollTrigger with scrub: true for smooth parallax tied to scroll position

Performance:
- Use gsap.context() and return cleanup function in useEffect to prevent memory leaks
- Register ScrollTrigger plugin once at the top level: gsap.registerPlugin(ScrollTrigger)
- Use will-change: transform on parallax elements
- Debounce scroll handlers if using custom scroll listeners
```

---

### Prompt 31: Backend API Route Extensions — Status Toggle, Manual Trigger, Stats, Logs, Reset

```text
Extend the backend API routes in backend/src/routes/api.ts to support the full dashboard functionality beyond the core hackathon-required init and feed endpoints. These additional endpoints power the dashboard's interactive features.

Implement these additional routes:

POST /api/agent/status — Toggle Agent Active/Stopped:
- Body: { agentId: string, status: "active" | "stopped" }
- Validate agentId exists and status is valid
- Update agent status in SQLite
- If status is "active": call startScheduler(agentId) to resume the autonomous loop
- If status is "stopped": call stopScheduler(agentId) to halt the loop
- Return: { success: true, agentId, status }
- 404 if agent not found, 400 if invalid params

POST /api/agent/trigger — Manual Cycle Trigger:
- Body: { agentId: string }
- Validate agentId exists
- Call runCycle(agentId) asynchronously (don't block the response)
- Return: { success: true, message: "Cycle triggered for agent {agentId}" }
- This allows the dashboard user to force an immediate discovery → judgment → writing cycle without waiting for the scheduler

GET /api/agents — List All Agents:
- No required params
- Query all agents from SQLite
- Return: { agents: Agent[] } with full persona objects

GET /api/stats — System Statistics:
- No required params
- Calculate aggregate statistics from the database:
  - totalAgents: count of all agents
  - totalPosts: count of all posts across all agents
  - totalReviews: count of all topic_reviews
  - acceptanceRate: accepted reviews / total reviews as percentage
  - totalRunLogs: count of all run_log entries
  - lastRunAt: timestamp of most recent run_log entry
- Return the stats object

GET /api/logs — Execution Logs & Topic Reviews:
- Optional query param: agentId (filter by specific agent)
- Query both topic_reviews and run_logs tables
- Return: { topicReviews: TopicReview[], runLogs: RunLog[] }
- Sort both arrays by timestamp descending (newest first)

POST /api/reset — Clear All Data:
- No body required
- Stop ALL schedulers (call stopScheduler() with no agentId)
- Clear all rows from all tables: agents, posts, topic_reviews, run_log
- Return: { success: true, message: "All agents and generated data cleared successfully." }
- This is a development/testing utility — allows starting fresh

Modify the existing GET /api/agent/feed:
- Support agentId="all" or no agentId param to return posts from ALL agents (not just one)
- Sort all posts by createdAt descending
- Map to the same response shape as the per-agent feed

Error Handling:
- Every route wrapped in try/catch with consistent error response: { error: "Internal server error" }
- Log errors to console.error with context
- Use proper HTTP status codes: 200 for success, 400 for validation, 404 for not found, 500 for internal errors

CORS:
- Ensure CORS is configured to allow requests from the frontend development server (localhost:5173)
```

---

### Prompt 32: TypeScript Types — Shared Type Definitions

```text
Define comprehensive TypeScript type definitions for both the backend and frontend in their respective types files.

Backend Types (backend/src/types/index.ts):

PersonaProfile interface:
- name: string
- domain: string
- bio: string
- voice: { tone: string, sentenceStyle: string, personPOV: "first" | "third", signaturePhrases?: string[] }
- interests: string[] (5-8 bounded sub-topics)
- opinions: string[] (4-6 recurring stances)
- publishingStandards: string[] (explicit rubric criteria)

Agent interface:
- agentId: string
- persona: PersonaProfile (the full expanded persona object)
- status: "active" | "stopped"
- createdAt: string (ISO 8601)
- nextRunAt?: string (ISO 8601, optional)

Post interface:
- id: string (UUID)
- agentId: string
- createdAt: string (ISO 8601)
- text: string
- rationale: string
- sources: string[] (array of real URLs)
- topicKey: string (normalized slug)

TopicReview interface:
- id?: number (autoincrement from SQLite)
- agentId: string
- reviewedAt: string (ISO 8601)
- candidateTitle: string
- candidateUrl: string
- verdict: "accept" | "reject"
- reason: string
- noveltyScore: number (0-1)
- relevanceScore: number (0-1)

RunLog interface:
- id?: number (autoincrement)
- agentId: string
- startedAt: string (ISO 8601)
- finishedAt?: string (ISO 8601)
- outcome: "published" | "skipped_no_candidates" | "skipped_all_rejected" | "dedup_blocked" | "error"
- detail?: string

DiscoveryCandidates interface:
- title: string
- url: string
- snippet: string
- publishedAt?: string

JudgmentReview interface:
- candidate: DiscoveryCandidates
- verdict: "accept" | "reject"
- reason: string
- noveltyScore: number
- relevanceScore: number

JudgmentResult interface:
- all: JudgmentReview[]
- accepted: DiscoveryCandidates | null

DraftPost interface:
- text: string
- rationale: string
- sources: string[]

SystemStats interface:
- totalAgents: number
- totalPosts: number
- totalReviews: number
- acceptanceRate: number
- totalRunLogs: number
- lastRunAt?: string

Frontend Types (frontend/src/types.ts):
- Mirror the backend types but adapted for frontend consumption
- Agent, Post, TopicReview, RunLog, SystemStats
- Ensure all types match the API response shapes
```

---

### Prompt 33: Jest Test Suite — API Contract, Feed Ordering, Dedup Verification

```text
Write a comprehensive Jest test suite for the backend API that verifies the hackathon contract requirements. These tests prove that the API behaves exactly as specified in the TRD and will pass the automated Stage 1 verification.

Test File: backend/tests/api.test.ts (or jest.config.js + tests directory)

Setup:
- Import supertest for HTTP testing
- Import the Express app (or create a test instance)
- Setup and teardown: create a fresh test database before each test suite, clean up after
- Use the test database path (not the production database)

Test Suite 1: POST /api/agent/init — Contract Compliance
- Test: "should return 200 with agentId on valid init"
  - POST /api/agent/init with body { persona: { name: "TestBot", domain: "Testing" } }
  - Assert status 200
  - Assert response body has "agentId" property
  - Assert agentId is a non-empty string (UUID format)

- Test: "should return 400 when persona.name is missing"
  - POST with { persona: { domain: "Testing" } }
  - Assert status 400
  - Assert error message in response

- Test: "should return 400 when persona.domain is missing"
  - POST with { persona: { name: "TestBot" } }
  - Assert status 400

- Test: "should return 400 when persona is entirely missing"
  - POST with empty body {}
  - Assert status 400

Test Suite 2: GET /api/agent/feed — Contract Compliance
- Test: "should return { posts: [] } for a newly created agent"
  - Create agent via init
  - GET /api/agent/feed?agentId={agentId}
  - Assert status 200
  - Assert response body has "posts" property
  - Assert posts is an empty array

- Test: "should return { posts: [] } for unknown agentId"
  - GET /api/agent/feed?agentId=nonexistent-id
  - Assert status 200
  - Assert response body is { posts: [] }

- Test: "should return posts with exact contract field names"
  - (If posts exist) Assert each post has: id (string), createdAt (ISO 8601 string), text (string), rationale (string), sources (array)

Test Suite 3: Feed Ordering & Immutability
- Test: "should return posts in newest-first order"
  - Create multiple posts with different timestamps
  - GET feed
  - Assert createdAt values are in descending order

- Test: "should not remove previously returned posts when new ones are added"
  - GET feed, record post count
  - Add new posts
  - GET feed again
  - Assert new count >= old count
  - Assert all previously returned post IDs still exist in the new response

Test Suite 4: Dedup Backstop
- Test: "should block a repeated topic_key from being published"
  - Verify that the dedup mechanism prevents duplicate topic keys

Configure Jest:
- jest.config.js with TypeScript support (ts-jest)
- Set testTimeout to 30000 (some tests involve LLM calls which are slow)
- Coverage reporting enabled
```

---

### Prompt 34: README.md — Comprehensive Project Documentation

```text
Write a comprehensive README.md for the CogniPulse project. This README serves multiple purposes: it's the first thing evaluators see on GitHub, it's the setup guide for running the project, and it documents the architectural decisions made. Make it professional, well-organized, and thorough.

Include these sections:

1. Project Title & Description:
   - "Autonomous AI Creator — Persona Agent"
   - One-paragraph summary: what it does, how it works, what makes it different from typical AI content generation
   - Key highlights: fully autonomous after init, genuine editorial judgment, persistent memory, consistent persona voice, paced publishing

2. Quick Start (3-step setup):
   - Prerequisites: Node.js 20+, Groq API key
   - Clone, install, configure .env, build, start
   - The service starts listening, creates/loads SQLite database, resumes active agents

3. API Reference:
   - POST /api/agent/init: request/response examples with JSON code blocks
   - GET /api/agent/feed: request/response examples
   - Additional endpoints: /api/agents, /api/stats, /api/logs, /api/agent/status, /api/agent/trigger, /api/reset

4. Architecture:
   - ASCII diagram of the full system (API Layer → Agent Runtime → Discovery → Judgment → Writer → Persistence)
   - Component descriptions: Persona Module, Scheduler, Discovery, Judgment, Writer, Memory, Persistence
   - Tech stack table with justifications

5. Frontend Dashboard:
   - Description of the React + Vite control room
   - Screenshots or descriptions of key views: Overview, Feed, Judgments, Workflows, Persona, Logs
   - How to run the frontend development server

6. How It Works (The Autonomous Loop):
   - Step-by-step explanation of the discovery → judgment → writing → publishing cycle
   - Memory and dedup mechanism
   - Scheduling and jitter for natural cadence
   - Boot resume for restart resilience

7. Configuration:
   - All environment variables with descriptions, types, and defaults
   - GROQ_API_KEY(S), DATABASE_PATH, MIN/MAX_CYCLE_MINUTES, PORT, DEV_FAST_CYCLE, TAVILY_API_KEY

8. Development & Testing:
   - Fast cycle mode for rapid local testing (DEV_FAST_CYCLE=true)
   - Running the test suite (npm test)
   - Soak testing strategy

9. Deployment:
   - Vercel full-stack deployment (Vite frontend + Express Serverless API functions with sql.js in /tmp)
   - Recommended platforms: Render, Railway, Fly.io, or a small VM with pm2
   - Docker deployment option (if applicable)
   - Persistent volume requirement for SQLite

10. Design Decisions:
    - Why SQLite over PostgreSQL (zero-ops, durable, inspectable)
    - Why Groq over direct Anthropic API (speed, cost)
    - Why jittered intervals over cron (human-like cadence)
    - Why dual-layer dedup (LLM + deterministic backstop)

11. License
```

---

### Prompt 35: Git Commit History — Structured Development Progression

```text
I need help structuring my git commit history to clearly demonstrate genuine development activity during the hackathon. The commits should tell a story of iterative development — from initial specification to backend architecture to frontend implementation to polish and testing. Each commit should represent a meaningful unit of work.

Suggested commit progression:
1. "Initial project scaffold: PRD.md and TRD.md specifications" — First commit with planning documents
2. "Backend scaffold: Express server, TypeScript config, SQLite schema" — Base backend setup
3. "Implement POST /api/agent/init and GET /api/agent/feed endpoints" — Core API contract
4. "Add Groq LLM service: persona generation with multi-key pool" — LLM integration
5. "Implement topic discovery: multi-source fetcher (Dev.to, HackerNews, Reddit)" — Discovery module
6. "Add editorial judgment engine with dual-layer dedup" — Judgment system
7. "Implement post writer with persona voice and rationale" — Writer module
8. "Add autonomous scheduler with jitter and boot resume" — Scheduler
9. "Frontend: React + Vite scaffold with routing and design system" — Frontend base
10. "Implement WorkflowCanvas: interactive node-based pipeline visualization" — Canvas component
11. "Add dashboard views: Overview, Feed, Judgments, Persona, Logs" — Core views
12. "Landing page with GSAP scroll animations and hero section" — Landing page
13. "Auth page with form validation and password strength meter" — Auth flow
14. "Add modals: CreateAgent, UserProfile, HelpDoc, Logout" — Supporting modals
15. "Dark/light theme system with CSS variable tokens" — Theme support
16. "Framer Motion animations: spring physics and micro-interactions" — Animation polish
17. "Fix light mode text visibility across all components" — Theme fixes
18. "Add Jest test suite: API contract, feed ordering, dedup" — Tests
19. "Comprehensive AI_USAGE.md with full prompt history" — Documentation
20. "Final polish: README, deployment guide, .env.example" — Final touches
```

---

### Prompt 36: Verify.sh — Automated Submission Verification Script

```text
Create a verification script (verify.sh) that automatically checks all Stage 1 eligibility requirements before submission. This script should be runnable locally to confirm the submission is valid.

Checks to implement:
1. Repository structure: Verify key files exist (package.json, README.md, AI_USAGE.md, PRD.md, TRD.md, backend/src/, frontend/src/)
2. Backend build: Run npm run build in the backend directory and check for successful compilation
3. Frontend build: Run npm run build in the frontend directory and check for successful compilation
4. API contract: Start the backend server, call POST /api/agent/init and verify the response shape matches { agentId: string }, call GET /api/agent/feed and verify { posts: [] } response
5. Dependencies: Check that all required npm packages are installed
6. Environment: Check that .env.example exists with all required variables documented
7. AI Usage Log: Verify AI_USAGE.md exists and is non-empty

Output:
- Print colored pass/fail results for each check
- Exit with code 0 if all checks pass, non-zero if any fail
- Include a summary at the end showing total passed/failed checks
```

---

### Prompt 37: Soak Test Script — Compressed Cycle Testing

```text
Create a soak test script or npm command that runs the autonomous agent loop with compressed cycle intervals for rapid local testing. This allows watching several full discovery → judgment → writing → publish cycles happen in a couple of minutes instead of waiting hours.

Implementation:
- Set DEV_FAST_CYCLE=true environment variable to divide all intervals by 60x
- Normal 90-240 minute intervals become 90-240 second intervals (1.5-4 minutes)
- Alternatively, set MIN_CYCLE_MINUTES=1 MAX_CYCLE_MINUTES=3 for even faster testing
- Start the backend server with fast cycle config
- Call POST /api/agent/init with a test persona (e.g., "TestBot" / "AI Security")
- Wait for 5-10 minutes and then check GET /api/agent/feed
- Print the feed output showing published posts with rationale and sources
- Print topic_reviews showing both accepted and rejected judgments
- Verify that at least 2-3 posts were published and at least 1 topic was rejected

This proves:
1. The autonomous loop actually runs without human intervention
2. Editorial judgment produces both accepts and rejects
3. Memory/dedup prevents repeat topics
4. Rationale and real sources are present on every post
5. The system is stable over multiple cycles without crashes
```

---

### Prompt 38: NodePanel Component — Compact Node Detail Viewer

```text
Build a compact NodePanel component (NodePanel.tsx) that displays basic information about the currently selected workflow canvas node. This is a simpler alternative to the full RightInspectorPanel — shown inline near the canvas or as a small floating card.

Display:
- Node name and category
- Key parameters as label/value pairs
- Status indicator
- Brief description of what this pipeline stage does

Keep it minimal — under 100 lines of code. It's supplementary to the main inspector panel.
```

---

### Prompt 39: Package.json Configuration — Workspace, Scripts, Dependencies

```text
Configure the root package.json for the monorepo workspace setup, plus individual package.json files for backend and frontend.

Root package.json:
- name: "cognipulse"
- Scripts: "dev" (concurrently run backend and frontend dev servers), "build" (build both), "start" (start production), "test" (run backend tests)
- Workspace: references to backend/ and frontend/

Backend package.json:
- Dependencies: express, better-sqlite3, uuid, dotenv, groq-sdk, cors
- Dev dependencies: typescript, ts-node, @types/express, @types/better-sqlite3, @types/uuid, @types/cors, jest, ts-jest, @types/jest, supertest, @types/supertest
- Scripts: dev, build, start, test

Frontend package.json:
- Dependencies: react, react-dom, react-router-dom, framer-motion, lucide-react, gsap
- Dev dependencies: typescript, vite, @vitejs/plugin-react, @types/react, @types/react-dom
- Scripts: dev, build, preview
```

---

### Prompt 40: Final Polish — Error Boundaries, Loading States, Edge Cases

```text
Do a final comprehensive polish pass across the entire application, ensuring every edge case is handled gracefully:

1. Loading States:
   - Add shimmer/skeleton loading placeholders when data is being fetched
   - Show "Loading agents..." message on initial dashboard load
   - Spinner on all buttons during async operations
   - Graceful handling of slow network responses

2. Error States:
   - If backend is unreachable, show a connection error banner at the top of the dashboard
   - If a specific API call fails, show an inline error message (not just console.error)
   - Retry buttons on failed operations

3. Empty States:
   - Every list view (Feed, Judgments, Logs) has a meaningful empty state with icon and description
   - Overview dashboard handles zero agents gracefully (show CTA to create first agent)
   - Templates view shows "no templates" if somehow empty

4. Data Refresh:
   - Auto-refresh every 8 seconds for real-time feel
   - Manual refresh button in the header
   - Show "Last updated: Xs ago" indicator
   - Don't flash/flicker on refresh — preserve scroll position and UI state

5. Responsive Layout:
   - Sidebar collapses on small screens
   - Cards stack vertically on mobile
   - Modals are full-screen on very small viewports
   - Touch-friendly hit targets (min 44px)

6. Keyboard Navigation:
   - Escape closes modals
   - Tab navigation through form inputs
   - Enter submits forms

7. Console Cleanup:
   - Remove any debug console.log statements from production code
   - Keep essential info/warn/error logs for debugging
   - No TypeScript errors or warnings in the browser console

This is the final pass before submission — the app should feel complete, stable, and polished.
```

---

## 4. Stage 1 & Stage 2 Checklist Compliance

| Requirement | Status | Evidence |
|---|---|---|
| Repository publicly accessible | ✅ Pass | [github.com/Manav373/CogniPulse](https://github.com/Manav373/CogniPulse) |
| Repository URL valid and accessible | ✅ Pass | Public GitHub repository with clean history |
| Live Demo URL functional | ✅ Pass | Deployed application with working API endpoints |
| AI Usage Log included and accessible | ✅ Pass | This file (`AI_USAGE.md`) — 40 detailed prompts with full text |
| Submission belongs to registered team | ✅ Pass | Manav373 team registration confirmed |
| Submission received before deadline | ✅ Pass | Submitted within hackathon window |
| Repository created during hackathon | ✅ Pass | Created August 8, 2026 — after official kickoff |
| Genuine development activity | ✅ Pass | 20+ incremental commits showing iterative development |
| AI Usage Log corresponds to features | ✅ Pass | Each prompt directly maps to implemented features in the codebase |
| Prompt history complete and detailed | ✅ Pass | 40 comprehensive prompts covering every aspect of development |

---

## 5. AI Tool Contribution Summary

| Development Phase | Prompts Used | Features Implemented |
|---|---|---|
| Planning & Specification | Prompts 1-2 | PRD.md, TRD.md |
| Backend Architecture | Prompts 3-8 | Express server, SQLite DB, API routes, LLM service, scheduler, discovery fetcher |
| Frontend Foundation | Prompt 9 | React + Vite scaffold, routing, design system, TypeScript types |
| Core Dashboard Components | Prompts 10-16 | WorkflowCanvas, LeftNavSidebar, FeedTab, JudgmentTab, PersonaTab, LogsTab, OverviewView |
| Supporting Components | Prompts 17, 22-26 | CreateAgentModal, AddNodesSidebar, TemplatesView, CredentialsView, VariablesView, modals |
| Landing Page & Auth | Prompts 18-20 | LandingPage with GSAP, Interactive3DAgent, AuthPage with validation |
| Inspector & Detail Panels | Prompts 21, 38 | RightInspectorPanel, NodePanel |
| Visual Design & CSS | Prompts 27-28 | Complete CSS design system, dark/light theme fixes |
| Animations & Polish | Prompts 29-30 | Framer Motion spring physics, GSAP ScrollTrigger |
| API Extensions | Prompt 31 | Status toggle, manual trigger, stats, logs, reset endpoints |
| Types & Testing | Prompts 32-33 | TypeScript types, Jest test suite |
| Documentation | Prompts 34-37 | README.md, verify.sh, soak test script, git commit structure |
| Final Polish | Prompts 39-40 | Package configuration, error handling, loading states, edge cases |

---

## 6. Live Steer Challenge Strategy (Stage 4 Readiness)

In the event of qualifying for Stage 4 (Live Steer Challenge):

1. **Modular Architecture**: Components are strictly decoupled — Backend routes, services, DB layer; Frontend state, canvas, sidebars — enabling rapid feature extension during the 20-minute live build window.

2. **AI Co-pilot Workflow**: Structured prompt templates (as demonstrated in this document) enable rapid, predictable feature generation with the AI agent.

3. **Validation & Test Automation**: Automated verification script (`verify.sh`) and Jest test suite guarantee zero regressions during live modifications.

4. **Design System Foundation**: CSS variable tokens and reusable component patterns allow instant visual customization without cascading breakage.
