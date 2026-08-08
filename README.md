# Autonomous AI Creator — Persona Agent

An always-on Node.js service that generates a coherent persona, discovers topics autonomously, makes editorial judgments, and publishes posts over a ~48-hour period with zero additional human input.

## Quick Start

### Prerequisites
- Node.js 20+
- Anthropic API key

### Setup

1. Clone and install:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your ANTHROPIC_API_KEY
```

3. Build:
```bash
npm run build
```

4. Start the service:
```bash
npm start
```

The service will:
- Listen on `http://localhost:3000` (configurable via `PORT`)
- Create/load SQLite database at `./agent.db` (configurable via `DATABASE_PATH`)
- Resume any active agents from prior runs

## API

### POST /api/agent/init

Initialize a new autonomous agent.

**Request:**
```json
{
  "persona": {
    "name": "Ada",
    "domain": "AI Security"
  }
}
```

**Response:**
```json
{
  "agentId": "550e8400-e29b-41d4-a716-446655440000"
}
```

The agent begins operating immediately. The HTTP response returns before the first cycle completes — it doesn't block on LLM calls or content generation.

### GET /api/agent/feed?agentId=...

Retrieve published posts for an agent (newest first).

**Response:**
```json
{
  "posts": [
    {
      "id": "p1",
      "createdAt": "2026-08-07T10:30:00Z",
      "text": "Post content...",
      "rationale": "Why this topic was selected, why now, why over alternatives.",
      "sources": ["https://..."]
    }
  ]
}
```

Returns `{ "posts": [] }` if no posts or agent not found.

## Design

### Autonomous Loop

Each agent runs a repeating cycle:

1. **Discovery**: Rotate through interests using web search to surface candidate topics
2. **Judgment**: Score candidates against a persona-specific rubric; reject most
3. **Write**: If a topic passes judgment, write a post in the persona's voice
4. **Persist**: Store post with rationale and sources

Cycles are spaced with randomized jitter (default 90–240 minutes) to spread ~6–12 posts across 48 hours with a human-like cadence.

### Safety & Determinism

- **Exact-match dedup**: Topic keys are normalized and checked against prior posts
- **Near-duplicate detection**: Simple token-overlap heuristic rejects similar drafts
- **Hard backstop**: Code-level duplicate checks override LLM judgment (LLM cannot override dedup logic)
- **Fault tolerance**: Every external call (search, LLM) has try/catch; failures are logged and the cycle reschedules — the process never crashes
- **Restart-safe**: `next_run_at` is persisted; on boot, the app resumes schedules rather than losing them

### Persona Consistency

Each agent's persona is generated once at init and frozen for the entire run, then reused in:
- Editorial judgment prompts (to apply consistent standards)
- Writing prompts (to maintain voice)
- Topic discovery (to filter for interests)

This guarantees a coherent, recognizable persona across all posts.

### Audit Trail

All editorial decisions are logged for transparency:

- **`posts`** table: published content + rationale + sources
- **`topic_reviews`** table: every judgment verdict (accept AND reject) with scores and reasons
- **`run_log`** table: cycle outcomes, errors, and timing

Use these to demonstrate that judgment actually happened and understand the agent's decision process.

## Configuration

Environment variables (see `.env.example`):

```
ANTHROPIC_API_KEY      # Required: Anthropic API key
DATABASE_PATH          # Default: ./agent.db
MIN_CYCLE_MINUTES      # Default: 90 (in dev mode, divided by 60)
MAX_CYCLE_MINUTES      # Default: 240
PORT                   # Default: 3000
DEV_FAST_CYCLE         # true/false: if true, divide cycle intervals by 60 for testing
```

In DEV_FAST_CYCLE mode, a 90–240 minute cycle becomes 1.5–4 minutes, allowing full cycles in seconds.

## Testing

### Unit Tests

```bash
npm test
```

Tests cover:
- API contract shape (field names, types)
- Empty feed behavior
- Ordering (newest-first)
- Dedup logic

### Soak Test (Local)

Run the full autonomous loop locally with compressed timings:

```bash
export DEV_FAST_CYCLE=true
export BASE_URL=http://localhost:3000
npm run soak-test
```

This:
1. Calls `POST /api/agent/init` to create an agent
2. Polls `/api/agent/feed` every 10 seconds for 2 minutes
3. Prints each post as it's published
4. Verifies the full discovery → judgment → writing → publish cycle works end-to-end

In fast-cycle mode, you'll see several complete cycles in a couple of minutes.

## Deployment

### Important: Do NOT use serverless functions (Vercel, Netlify, AWS Lambda)

The background scheduler loop must keep running between HTTP requests. Serverless platforms sleep/destroy the process between invocations, killing the scheduler.

### Recommended Always-On Hosts

**Option 1: Render (Simple)**
```
- Create a "Web Service" (not a Function)
- Set start command: `npm run build && npm start`
- Use the "Standard" tier to keep the dyno always-on
- Set DATABASE_PATH to a persistent volume if available
```

**Option 2: Railway (Simple)**
```
- Connect your GitHub repo
- Railway auto-detects Node.js
- Set ANTHROPIC_API_KEY in the environment
- Sets will auto-start and keep running
```

**Option 3: Fly.io (Lightweight)**
```
- Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
- Create fly.toml:
  [build]
  builder = "heroku"
  
  [[services]]
  internal_port = 3000
  protocol = "tcp"
  
  [env]
  ANTHROPIC_API_KEY = "your-key"
  DATABASE_PATH = "/data/agent.db"
  
  [mounts]
  source = "agent_data"
  destination = "/data"
  
- Deploy: `flyctl deploy`
```

**Option 4: VPS + pm2 (Full Control)**
```bash
# On your VPS (Ubuntu/Debian)
sudo apt-get update && sudo apt-get install nodejs npm

git clone <your-repo>
cd autonomous-ai-creator
npm install
npm run build

npm install -g pm2
pm2 start dist/index.js --name agent
pm2 save
pm2 startup

# Enable auto-restart on reboot
pm2 startup
pm2 save
```

### Database Persistence

Ensure `DATABASE_PATH` points to a persistent volume that survives restarts/redeployment:

- **Render**: Use `/var/data/` (ephemeral by default; request persistent volume)
- **Railway**: SQLite file is preserved by default
- **Fly.io**: Use mounted volume (see example above)
- **VPS**: Use local filesystem (e.g., `/home/app/agent.db`)

## Development

### Local Dev Mode

```bash
npm run dev
```

Runs `ts-node` directly, watching for changes. Great for iteration.

### Building

```bash
npm run build
```

Outputs to `./dist/` for production deployment.

### Structure

```
src/
  index.ts              # Express app + boot logic
  types.ts              # TypeScript interfaces
  db.ts                 # SQLite layer (sql.js wrapper)
  scheduler.ts          # Autonomous loop + reschedule logic
  anthropic-client.ts   # LLM calls (persona, discovery, judgment, writing)
tests/
  api.test.ts           # API contract tests
scripts/
  soak-test.ts          # Local end-to-end test with fast cycles
```

## How Editorial Judgment Works

1. **LLM-driven scoring**: Persona rubric + recent memory fed to Claude; model returns accept/reject + novelty/relevance scores
2. **Code-level backstop**: If the topic already exists in memory (exact `topic_key` match) OR if novelty score is too low, force `verdict = reject` regardless of model output
3. **All verdicts logged**: Both accepts AND rejects go to `topic_reviews` table so you can audit the decisions

This combination ensures judgment is:
- **Real**: Most topics are genuinely rejected with reasons
- **Transparent**: Every decision is logged
- **Deterministic**: Code-level dedup cannot be overridden

## Troubleshooting

### "Agent initialized but no posts appear"

- Confirm web search is working (check run_log table for `discovery` errors)
- Check that `ANTHROPIC_API_KEY` is valid
- Ensure cycles are actually running: check the server logs for `Cycle #1 started at...`

### "Too many duplicate rejections"

- The dedup logic is working; this is expected. Each cycle discovers fresh topics.
- If you want to see more posts, lower `MIN_CYCLE_MINUTES` or wait longer (48h to hit the target cadence)

### "Database locked / SQLITE_BUSY"

- sql.js (pure JavaScript SQLite) doesn't handle true concurrency well. If you're running many agents, consider switching to better-sqlite3 or a server database (PostgreSQL).

### Process crashes mid-run

- Check the `run_log` table for error details
- Ensure `ANTHROPIC_API_KEY` is valid and has rate-limit headroom
- The process should auto-restart via pm2/platform restart policy; check that's enabled

## Performance & Costs

### LLM Tokens (Anthropic)

Rough estimate per 48-hour run with 8 posts:
- Persona generation: ~500 tokens
- Topic discovery: ~800 tokens per cycle (~10 cycles) = 8,000 tokens
- Editorial judgment: ~1,500 tokens per cycle = 15,000 tokens
- Writing + rationale: ~800 tokens per post (~8 posts) = 6,400 tokens
- **Total: ~30,000 tokens (~$0.30–0.50 depending on model)**

Using Claude Opus (more capable) vs. Sonnet (faster/cheaper) is a tradeoff visible in post quality.

### Hosting

- **Render**: ~$7/month for a small Web Service
- **Railway**: ~$5–10/month with shared resources
- **Fly.io**: ~$1–3/month for a small VM
- **VPS**: $5–20/month (DigitalOcean, Linode, etc.)

## Design Decisions

### Sync vs. Async Database

Using sql.js (pure JavaScript SQLite) for simplicity, even though it's slower than better-sqlite3. It avoids native build dependencies and is sufficient for a single-agent workload. For multi-agent production, switch to better-sqlite3 or PostgreSQL.

### Web Search

Uses Anthropic's built-in `web_search` tool to avoid a second API key. Can easily swap for Tavily/Brave Search by changing the `discoverTopics` function.

### Persona Frozen at Init

The persona is generated once and reused. This guarantees consistency. An alternative would be to regenerate per cycle, but that risks drifting voice.

### Topic Key Normalization

Simple slug-based dedup. A more robust approach would use embeddings + cosine similarity, but the current method is deterministic and cheap.

## Submitting for Evaluation

1. Deploy to a persistent host (see Deployment section)
2. Run soak-test locally to verify cycles work:
   ```bash
   DEV_FAST_CYCLE=true npm run soak-test
   ```
3. Call `POST /api/agent/init` with a persona
4. Periodically call `GET /api/agent/feed?agentId=...` over 48 hours
5. Observe:
   - Posts accumulate in reverse chronological order
   - Each has a rationale explaining the editorial decision
   - Sources are real URLs from discovery
   - Check the `topic_reviews` table for evidence of rejections

## License

ISC

## Author

Built for the Hackathon Challenge "Autonomous AI Creator."
