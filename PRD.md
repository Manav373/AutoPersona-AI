# Product Requirements Document (PRD)
## Project: Autonomous AI Creator — "Persona Agent"

**Version:** 1.0
**Status:** Draft for build
**Owner:** [You]
**Source spec:** Hackathon challenge #3 — "Autonomous AI Creator"

---

## 1. Background & Problem Statement

Most "AI-generated content" today is human-triggered: a person writes a prompt, the model writes a post. There is no independent editorial process — no discovery, no judgment, no memory, no cadence.

This project builds an agent that, once given an identity, behaves like a real online creator: it watches the world, decides for itself what is worth saying, writes in a stable voice, remembers what it already said, and publishes on its own schedule — with zero further human input for the life of the evaluation window (~48 hours).

The deliverable is judged entirely through two HTTP endpoints. There is no UI requirement and no real social platform integration — publishing is simulated and observed via a feed API.

## 2. Goals

| # | Goal |
|---|------|
| G1 | Agent operates fully autonomously after a single `init` call — no further prompts, no human triggers, no evaluator-supplied topics. |
| G2 | Agent demonstrates real editorial judgment — it must visibly reject topics, not just publish everything it finds. |
| G3 | Agent maintains one coherent, recognizable persona (voice, interests, opinions) across every post. |
| G4 | Agent has working memory — it does not repeat itself and can reference/avoid prior coverage. |
| G5 | Publishing is paced over the full observation window, not front-loaded. |
| G6 | Every post is transparent about *why* it exists: rationale + sources, returned by the API. |
| G7 | System survives 48 hours unattended: no crashes, no manual restarts, state persists.

## 3. Non-Goals (Out of Scope)

- Posting to real LinkedIn/X/any real platform.
- Multi-platform formatting.
- Images, video, or other rich media generation.
- Engagement metrics, likes/comments simulation, analytics.
- Multi-agent systems (e.g., a "critic" agent talking to a "writer" agent) — a single coherent agent is sufficient and preferred for simplicity/reliability.
- Human-in-the-loop approval after init.
- Authentication/multi-tenant user accounts (single agent per init call is fine, but design should not preclude multiple agentIds).

## 4. Users / Evaluators

Primary "user" is the **evaluator**, who will:
1. Call `POST /api/agent/init` exactly once with a persona (name + domain).
2. Periodically call `GET /api/agent/feed?agentId=...` over ~48 hours, expecting to see new, rationale-backed posts appear on their own.
3. Judge on: autonomy, editorial quality, persona consistency, memory effectiveness, rationale transparency, overall feed quality.

Secondary "user" is the builder (you), who needs to be able to stand the service up, point it at an LLM + search API, and walk away.

## 5. Persona Requirements

The persona is supplied at init time (`name`, `domain`) but the **agent must flesh it out into a full identity** immediately on init and hold it fixed for the run:

- A stable **voice**: sentence rhythm, vocabulary level, formality, use of humor/snark, first-person vs. third-person framing.
- **Stable interests**: a bounded set of sub-topics within the domain (e.g., for "AI Security": prompt injection, model exfiltration, red-teaming, agentic-tool risk — not general tech news).
- **Distinct editorial opinions**: recurring stances the persona is known for (e.g., "skeptical of benchmark-driven hype," "pro open-weights," "obsessed with real-world exploit chains over theoretical CVEs").
- A **publishing standards rubric** the persona applies consistently (see §6.2) — this is what makes rejections meaningful rather than random.

Recommended default persona archetypes (if none supplied or to seed the system prompt): AI Security Researcher, ML Engineer, AI Product Analyst, OSS Contributor, Robotics Engineer, Developer Advocate, AI Ethics Researcher.

## 6. Functional Requirements

### 6.1 Topic Discovery
- The agent independently pulls candidate topics from a **live** source (web search API / news API / RSS) — not a static hardcoded list.
- Discovery must run repeatedly over the 48-hour window (not once at init), so the feed reflects genuinely new information over time.
- Each discovery cycle should surface multiple candidate topics for the judgment stage to choose among (so "rejecting most of what it finds" is a real behavior, not decorative).

### 6.2 Editorial Judgment
- The agent scores/evaluates each candidate topic against explicit, persistent criteria, e.g.:
  - Fit with the persona's declared interests.
  - Genuine novelty (not already covered — checked against memory).
  - Substance (not pure marketing/hype, has a concrete technical or factual hook).
  - Timeliness (recent enough to justify "why now").
- Topics that fail are **logged as rejected with a reason**, not silently dropped — this is how judgment quality is demonstrated to evaluators (rejected topics do not need to be exposed via the public feed API, but should be discoverable in the rationale, logs, or an internal record for defense/demo purposes).
- Not every discovery cycle needs to produce a post. Zero publishable topics in a cycle is an acceptable, even expected, outcome.

### 6.3 Consistent Persona
- Every generated post is produced through the same system-level persona definition (voice + interests + opinions), stored once at init and reused for every generation call — never regenerated per post.
- A lightweight self-consistency check (style/interest fit) can gate generated drafts before publishing.

### 6.4 Memory
- Every published post (topic, key claims, angle taken, timestamp) is persisted.
- Before writing, the agent checks new candidates against this memory to avoid:
  - Republishing the same topic.
  - Repeating the same angle/opinion verbatim on an adjacent topic.
- Memory must survive process restarts (durable storage, not in-memory-only).

### 6.5 Autonomous Publishing (pacing)
- After init, the agent runs an unattended loop (scheduler) that periodically: discovers → judges → (maybe) writes → (maybe) publishes.
- Publish cadence must be spread across the full window — e.g., target 6–12 posts over 48 hours with randomized jitter — not all generated at t=0 or in a tight burst.
- No further API calls or prompts from a human/evaluator should be required to trigger any of this.

### 6.6 Publishing Rationale (transparency)
Every post returned by the feed **must include**, in the API response itself:
- **Why the topic was selected** (what made it pass the editorial bar).
- **Why it's relevant now** (the timeliness hook).
- **Source(s)** the information came from (real URLs from the discovery step).

## 7. API Requirements (contract — must match exactly)

### `POST /api/agent/init`
Request:
```json
{ "persona": { "name": "Ada", "domain": "AI Security" } }
```
Response:
```json
{ "agentId": "abc-123" }
```
Called exactly once by the evaluator. Must be idempotent-safe against accidental double-calls (design decision documented in TRD) and must kick off the autonomous loop as a side effect, not require any further call to "start" it.

### `GET /api/agent/feed?agentId=abc-123`
Response:
```json
{
  "posts": [
    {
      "id": "p7",
      "createdAt": "2026-08-07T10:30:00Z",
      "text": "...",
      "rationale": "Why this topic was selected, why it is relevant now, and why it was chosen over other candidates.",
      "sources": ["https://..."]
    }
  ]
}
```
Requirements:
- Reverse chronological (newest first).
- Unique `id` per post.
- `createdAt` is ISO 8601 UTC.
- Previously returned posts remain available (never removed/mutated).
- Empty state returns `{ "posts": [] }`, never an error.

## 8. Success Metrics (mirrors evaluation criteria)

| Criterion | What "good" looks like |
|---|---|
| Autonomous operation | New posts appear across repeated feed polls over 48h with zero additional human/API triggers. |
| Editorial decision-making | Rationale text clearly differentiates *why this* over adjacent noise; internal reject log shows real filtering happened. |
| Persona consistency | A blind reader can identify the same "voice" and recurring stances across all posts. |
| Use of memory | No duplicate topics; later posts sometimes reference or build on earlier ones without repeating them. |
| Transparency of rationale | Every post has selection reason + timeliness reason + real, resolvable source URLs. |
| Feed quality | Posts read as substantive, not generic AI filler; cadence feels human, not batch-dumped. |

## 9. Constraints & Assumptions

- Evaluation window ≈ 48 hours; the service must run unattended for that entire period.
- "Simulated publishing" is explicitly acceptable — no real posting integration required.
- The service must be reachable via HTTP by the evaluator for the whole window (hosting must not sleep/idle-out between polls in a way that kills the background scheduler — see TRD §8).
- LLM and search API costs/rate limits must support ~1 discovery cycle every 1–4 hours for 48 hours plus occasional generation calls.

## 10. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Serverless host puts the process to sleep, killing the background scheduler | Use a persistent process (small VM / Railway / Render / Fly.io always-on worker) rather than pure serverless functions; document in TRD. |
| LLM/search API outage stalls the loop for hours | Loop is fault-tolerant: catch/log/retry with backoff, never crash the process; missing a cycle is fine, dying is not. |
| Topic discovery returns nothing novel | Acceptable to skip publishing that cycle; do not force a low-quality post to hit a quota. |
| Duplicate/near-duplicate posts slip past memory check | Use both an explicit topic-key and a semantic similarity check (embeddings or LLM-judged similarity) against recent memory. |
| Process restarts (deploy hiccup, crash) lose scheduler state | Persist all state (posts, rejected topics, next-run time) to disk/DB; on boot, resume rather than reset. |

## 11. Milestones

1. Persona + API contract implemented, `init`/`feed` return correct shapes (no autonomy yet).
2. Topic discovery wired to a live source.
3. Editorial judgment + rationale generation.
4. Memory + dedup.
5. Autonomous scheduler loop running end-to-end locally for a short window.
6. Deployed to an always-on host, soak-tested for several hours before submission.
