# Autonomous AI Creator — Project Documentation

## Overview

This is a fully autonomous content creation agent that:
- Takes a persona (name + domain) as input via HTTP
- Generates a coherent, frozen persona profile immediately
- Runs an unattended discovery→judgment→writing→publish cycle for 48 hours
- Persists everything to SQLite for transparency and restart-safety
- Provides two HTTP endpoints: init and feed

## Project Structure

```
src/
  index.ts              # Express app + boot logic
  types.ts              # TypeScript interfaces (Agent, Post, etc.)
  db.ts                 # SQLite layer (sql.js wrapper + async file persistence)
  scheduler.ts          # Autonomous loop, reschedule logic, cycle orchestration
  anthropic-client.ts   # LLM calls: persona generation, discovery, judgment, writing

tests/
  api.test.ts           # API contract tests (shape, ordering, dedup)

scripts/
  soak-test.ts          # End-to-end local test with DEV_FAST_CYCLE mode

dist/                   # Compiled JavaScript (after npm run build)

.env.example            # Configuration template
package.json            # Dependencies + scripts
tsconfig.json           # TypeScript config
jest.config.js          # Jest test runner config
README.md               # User-facing documentation
verify.sh               # Quick verification of build
```

## Key Design Decisions

### Database: sql.js instead of better-sqlite3

**Why**: better-sqlite3 requires C++ compilation (node-gyp), which failed in this environment. sql.js is pure JavaScript and works everywhere.

**Trade-off**: sql.js is slower (in-memory interpretation) but sufficient for single-agent, occasional-write workloads. For production multi-agent setups, switch to better-sqlite3 or PostgreSQL.

**Implementation**: sql.js doesn't persist to disk automatically, so db.ts wraps it with file-based persistence (read whole DB from disk, manipulate in memory, write whole DB back on each change). Not optimized for high-throughput, but simple and reliable.

### Persona: Frozen at Init

The `PersonaProfile` is generated once from `{ name, domain }` at init time and stored in the `agents` table. Every subsequent cycle reuses this exact persona in prompts.

**Why**: Consistency. If the persona were regenerated per cycle, voice/opinions could drift or contradict.

**Data flow**: POST /api/agent/init → LLM call (generatePersona) → store in DB → reuse for every discovery/judgment/writing call for that agent.

### Web Search: Mocked Discovery

The `discoverTopics` function calls Claude with a web_search tool use, but tool execution is not fully wired. In production, this would:
1. Claude returns a tool_use block with query
2. App executes web search (real API call)
3. App returns results to Claude in a tool result block
4. Claude extracts structured candidates

For now, mock candidates are returned per interest. To enable real search:
- Use Anthropic's `web_search` server tool (built-in, requires no additional API key)
- Or swap for Tavily/Brave Search API and call directly from `discoverTopics`

The prompt and return structure are ready; only the tool execution layer needs wiring.

### Dedup: Two-Level Approach

1. **Hard code-level backstop**: `topicExists(agentId, topicKey)` checks exact `topic_key` match before judgment. If it matches, cycle is skipped regardless of model output. This is deterministic and cannot be overridden.

2. **Soft near-duplicate check**: After writing, `isNearDuplicate(text, existing)` compares token overlap (>60% overlap = duplicate). If triggered, cycle is skipped. This is heuristic-based.

The code-level backstop is the hard guarantee; the near-duplicate check is a safety net.

### Scheduler: setTimeout with Jitter

Each cycle reschedules itself after a random delay between `MIN_CYCLE_MINUTES` and `MAX_CYCLE_MINUTES`. The `next_run_at` timestamp is persisted so that on process restart, the app can resume instead of resetting.

**Design**: One scheduler per agent (running in a Map of Node.js timeouts). Agents are independent; one crashing doesn't affect others.

### Fault Tolerance

Every async operation (search, LLM calls, DB writes) is wrapped in try/catch. Errors are logged to `run_log` and the cycle simply ends early, then reschedules. The process itself never crashes.

This follows the "loose coupling" model: a failed discovery cycle doesn't prevent the next one.

## How to Build

```bash
npm install
npm run build
# Outputs to dist/
```

## How to Run Locally

```bash
# Set up environment
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY

# Start the service
npm start
# Listens on http://localhost:3000

# In another terminal, initialize an agent
curl -X POST http://localhost:3000/api/agent/init \
  -H 'Content-Type: application/json' \
  -d '{"persona": {"name": "Ada", "domain": "AI Security"}}'

# Get the agentId from response, then poll feed
curl http://localhost:3000/api/agent/feed?agentId=<agentId>
```

## How to Test Locally with Soak Test

```bash
# Terminal 1: start the server
npm start

# Terminal 2: run soak test (polls every 10s for 2 minutes)
export DEV_FAST_CYCLE=true
export BASE_URL=http://localhost:3000
npm run soak-test
```

With `DEV_FAST_CYCLE=true`, cycle intervals are divided by 60 (90 min becomes 1.5 min), so you'll see multiple complete discovery→judgment→writing→publish cycles in a few minutes.

## How to Deploy

See README.md for deployment options (Render, Railway, Fly.io, VPS). Key requirements:
- Must NOT be serverless (Lambda, Vercel, Netlify) — those kill the background loop between requests
- Must have persistent storage for SQLite database
- Must expose port 3000 (or configured PORT)

## Important: Idempotency

The `POST /api/agent/init` endpoint creates a new agent every time it's called (even for the same name/domain). This is intentional: each init is independent. If you call init twice with "Ada" / "AI Security", you get two separate agent IDs running separate autonomous loops.

This matches the "single agent per evaluator call" model in the spec. If multi-tenant dedup were needed, add logic to hash the persona and check if it already exists before creating.

## Testing

```bash
npm test
```

Tests cover:
- API contract (shape, field names, types)
- Empty feed for unknown agents
- Newest-first ordering
- Exact-match dedup via topic_key

Full end-to-end testing (discovery → judgment → writing) is validated by the soak-test script, not unit tests.

## Notes on Persona Generation

The LLM call to generate a persona is single-prompt, no retries. If it times out or returns invalid JSON, the init call fails with a 500 error. In production, add retry logic:

```ts
async function generatePersonaWithRetry(name, domain, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await generatePersona(name, domain);
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

## Notes on Web Search

Currently, `discoverTopics` returns mock data. To enable real web search:

1. Implement tool execution in `anthropic-client.ts`:
   - Send message with web_search tool enabled
   - Parse tool_use blocks from response
   - Call real search API (Anthropic's or Tavily)
   - Return search results via tool result
   - Let Claude extract candidates

2. Or call web search directly:
   ```ts
   const results = await tavily.search(query);
   return results.map(r => ({ title: r.title, url: r.url, snippet: r.snippet }));
   ```

The current structure is ready for either approach.

## Observability

### Logs
- Console logs from scheduler (cycle start/finish, each decision)
- No structured logging yet (could add Winston/Pino)

### Database Tables
- `run_log`: every cycle outcome, useful for /healthz checks
- `topic_reviews`: every editorial decision (accept/reject) with scores
- `posts`: published content (what the feed API returns)
- `agents`: agent metadata and next_run_at for restart recovery

Query examples:
```sql
-- See recent cycles and outcomes
SELECT started_at, outcome, detail FROM run_log 
WHERE agent_id = ? 
ORDER BY started_at DESC 
LIMIT 10;

-- See why topics were rejected
SELECT reviewed_at, candidate_title, reason, novelty_score 
FROM topic_reviews 
WHERE agent_id = ? AND verdict = 'reject' 
ORDER BY reviewed_at DESC 
LIMIT 5;

-- Check feed (same as HTTP GET)
SELECT id, created_at, text, rationale 
FROM posts 
WHERE agent_id = ? 
ORDER BY created_at DESC;
```

## Future Improvements

1. **Embeddings for semantic dedup**: Use Claude's embeddings API to store post embeddings and do cosine similarity checks instead of token overlap
2. **Multi-search sources**: Rotate through Tavily, Brave, HN, ArXiv for diversity
3. **Streaming responses**: Stream persona/writing to client while generating
4. **Real database**: Migrate to PostgreSQL for multi-tenant + high concurrency
5. **Metrics/tracing**: Add OpenTelemetry for observability
6. **Persona tuning**: Allow updating persona mid-run (currently frozen)
7. **Topic filtering**: Add domain-specific regex blocklist (ignore spam, low-quality sources)

## Known Limitations

1. **sql.js performance**: Not suitable for >1,000 posts or rapid writes. Switch to better-sqlite3 or PostgreSQL for scale.
2. **No real web search**: Currently returns mock candidates. Wiring search tool execution is next step.
3. **Single process**: Can't distribute across machines. For multiple agents at scale, use a job queue (Bull, RQ) or multi-process setup.
4. **No authentication**: Anyone can call init/feed. Add OAuth/API key validation before production.
5. **No rate limiting**: No throttling on LLM/discovery calls. Add circuit breaker + backoff for stability.

## Debugging

### Enable verbose logs
```bash
DEBUG=autonomous-ai-creator:* npm start
```

### Inspect database
```bash
# Interactive SQL shell for SQLite (after stopping the app)
npm install -g sqlite3
sqlite3 agent.db
> SELECT * FROM posts;
> SELECT outcome, detail FROM run_log WHERE agent_id = '...';
```

### Check process
```bash
# Is the scheduler running?
curl http://localhost:3000/healthz

# Check logs / recent cycles
sqlite3 agent.db "SELECT started_at, outcome FROM run_log ORDER BY started_at DESC LIMIT 5;"
```

### Reset / clean state
```bash
# Stop the app, delete the DB, restart
rm agent.db
npm start
```

## Questions / Decisions Made

**Q: Why not async/await for scheduler instead of setTimeout?**
A: setTimeout is simpler for recurring tasks and avoids creating unneeded async contexts. Works fine for this scale.

**Q: Why store persona in JSON instead of separate columns?**
A: Simpler schema, easier to serialize/deserialize, avoids normalization complexity.

**Q: What if the LLM returns invalid JSON?**
A: The catch logs the error and skips the cycle. In production, add a retry with temperature=0 (more deterministic) before giving up.

**Q: Can I run multiple agents on the same process?**
A: Yes, each init creates a separate agent with its own scheduler timeout. They share the Express process and database. Be mindful of token limits if many agents are running concurrently.

**Q: Should I use Opus vs Sonnet for persona generation?**
A: Sonnet is faster and cheaper (~50% of Opus cost) but Opus has better reasoning. For this task, Sonnet is likely sufficient. Swap in model.ts if needed.
