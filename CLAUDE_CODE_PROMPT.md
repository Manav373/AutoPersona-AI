# One-Shot Build Prompt — paste this into Claude Code

Copy everything below the line into Claude Code (in a fresh project folder that also
contains `PRD.md` and `TRD.md` from this same drop). Claude Code will read those two
files as its spec and build the whole thing in one pass.

---

I'm building a submission for a hackathon challenge called **"Autonomous AI Creator."**
`PRD.md` and `TRD.md` are in this folder — **read both fully before writing any code.**
They are the authoritative spec. Build exactly what they describe. If anything below
conflicts with those files, the files win.

## What to build

A single always-on Node.js/TypeScript service (Express) that:

1. Exposes exactly two HTTP endpoints, matching the contract in TRD.md §4 byte-for-byte
   on field names and shapes:
   - `POST /api/agent/init`
   - `GET /api/agent/feed?agentId=...`
2. On `init`, expands the given `{ name, domain }` into a full, durable `PersonaProfile`
   (TRD §3.1) using the Anthropic Claude API, stores it, and **starts a background
   autonomous loop for that agent** — the HTTP response must return immediately
   (don't block on the first content cycle).
3. Runs that loop entirely unattended from then on: topic discovery (live web search) →
   editorial judgment (accept/reject with reasons, logged) → writing (persona-voiced,
   with rationale + real sources) → persistence — on a jittered interval spread across
   ~48 hours (TRD §3.2, §6).
4. Persists everything in SQLite (`better-sqlite3`) per the schema in TRD §3.7, on a
   path that survives restarts.
5. Is restart-safe: on boot, resume any `active` agent's schedule instead of losing it
   (TRD §6, "boot resume" logic).
6. Never crashes the process on an LLM/search failure — every stage is wrapped in
   try/catch, failures are logged to `run_log`, and the loop reschedules itself
   regardless (TRD §8).

## Tech choices (follow TRD §2 unless you have a strong reason not to — tell me if so)

- Node.js 20+, TypeScript, Express
- `better-sqlite3` for storage
- Anthropic Messages API for: persona generation, editorial judgment (forced JSON
  output), writing + rationale generation (forced JSON output)
- Use Anthropic's built-in `web_search` server tool for topic discovery (avoids a
  second API key) — implement it so it's easy to swap for Tavily/Brave later if I ask.
- `dotenv` for config: `ANTHROPIC_API_KEY`, `DATABASE_PATH`, `MIN_CYCLE_MINUTES`,
  `MAX_CYCLE_MINUTES`, `PORT`
- `pm2`-friendly (no reliance on serverless request/response lifecycle for the
  scheduler — it must keep running between HTTP calls)

## Editorial judgment must be real, not decorative

Implement both:
- The LLM-driven judgment call (persona rubric + candidates + recent-topics memory →
  accept/reject + reasons + novelty/relevance scores), AND
- A deterministic code-level backstop that force-rejects anything whose topic already
  matches recent memory (exact key match), regardless of what the model says.

Write every verdict (accept AND reject) to the `topic_reviews` audit table — this is
how I'll demo/prove editorial judgment actually happened, separate from what's exposed
in the public feed.

## Memory must actually prevent repeats

- Exact-match dedup via a normalized `topic_key` on every post.
- A second, softer check: compare a new draft's text similarity against recent posts
  (simple approach is fine — token overlap or embeddings, your call) and block
  near-duplicates before they're saved.
- Pass a compact "already covered" list from memory into both the judgment and writer
  prompts so the model itself is also steering away from repeats, not just the code
  gate.

## Rationale + sources are mandatory on every post

Every row written to `posts` must have non-empty `rationale` (why selected / why now /
why this over alternatives) and a `sources` array of **real URLs** carried through from
the discovery step — never invent sources.

## Deliverables

1. Full working repo: `src/` (TypeScript), `package.json`, `tsconfig.json`,
   `.env.example`, `README.md` explaining how to run it locally and how to deploy it
   somewhere always-on (per TRD §7 — call out explicitly that this must NOT be deployed
   as Vercel/Netlify serverless functions, and suggest 1–2 concrete always-on hosting
   options).
2. A `scripts/soak-test.ts` or npm script that runs the loop with a compressed interval
   (e.g. 30–90 seconds instead of hours) behind a `DEV_FAST_CYCLE=true` env flag, so I
   can watch several full discovery→judgment→writing→publish cycles happen in a couple
   of minutes during local testing, without touching the production cadence logic.
3. A short `tests/` suite (Jest or Vitest) covering at minimum:
   - `init` → `feed` round trip returns the exact contracted JSON shape
   - empty feed returns `{ "posts": [] }`
   - feed is newest-first and previously returned posts stay available after new ones
     are added
   - the dedup backstop actually blocks a repeated topic_key end-to-end
4. Implement everything in TRD §3 (all seven components) and the full schema in TRD §3.7
   — don't simplify away the `run_log` or `topic_reviews` tables, they're required for
   evaluation transparency.

## How to work

- Build iteratively: scaffold the project and get the two endpoints returning correct
  static-shaped responses first, then wire in persona generation, then discovery, then
  judgment, then writing, then the scheduler/loop, then restart-resume logic, then tests
  — running/testing after each stage rather than writing everything blind and debugging
  at the end.
- Ask me before making a call on any "Open Decision" listed in TRD §11 if you don't
  have a clear default — otherwise just pick the TRD's suggested default and note the
  choice in the README.
- When done, run the soak-test script yourself and show me a sample feed output with at
  least 2-3 published posts and at least one logged rejection, so I can sanity-check
  editorial judgment and persona voice before I do a real 48-hour deployment.
