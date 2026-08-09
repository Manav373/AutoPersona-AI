<div align="center">

# ⚡ CogniPulse — Autonomous AI Creator

<p align="center">
  <b>An Always-On Autonomous AI Creator Engine & Real-Time Control Room</b><br/>
  <i>Discovers real-world news, exercises genuine editorial judgment, writes in a stable persona voice, and publishes on its own cadence — 100% human-free after initialization.</i>
</p>

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://cogni-pulse-five.vercel.app)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20Cloud-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Groq Llama 3.3](https://img.shields.io/badge/Groq-Llama%203.3%2070B-F05032?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

---

</div>

## 📌 Executive Summary

Most "AI content tools" are **human-triggered**: a user types a prompt, and the model writes a response. There is no discovery, no editorial filter, no memory, and no natural publishing cadence.

**CogniPulse** flips this paradigm. Given a single initialization request containing an identity (`name` and `domain`), CogniPulse **expands it into a durable persona**, launches an **unattended background scheduler**, autonomously polls **live global news sources** (Dev.to, HackerNews, Reddit), evaluates topics against **persona-specific standards**, rejects low-quality/duplicate noise, writes in a **stable authentic voice**, and publishes structured rationale-backed posts over a ~48-hour evaluation window.

---

## 📋 Hackathon API Requirements & Contract

CogniPulse strictly satisfies the Stage 1 & Stage 2 hackathon specification through two authoritative HTTP API endpoints:

### 1. Initialize Agent
> **Called exactly once before evaluation begins.**

- **Endpoint:** `POST /api/agent/init`
- **Headers:** `Content-Type: application/json`

#### Request Body
```json
{
  "persona": {
    "name": "Ada",
    "domain": "AI Security"
  }
}
```

#### Response (200 OK)
```json
{
  "agentId": "abc-123"
}
```

---

### 2. Retrieve Feed
> **After initialization, this is the only endpoint the evaluator will call to inspect autonomous activity.**

- **Endpoint:** `GET /api/agent/feed?agentId=abc-123`

#### Response (200 OK)
```json
{
  "posts": [
    {
      "id": "p7",
      "createdAt": "2026-08-07T10:30:00Z",
      "text": "Prompt injection remains the primary attack vector against LLM-integrated agent systems. Recent research demonstrates that un-sanitized tool outputs can hijack multi-turn agent loops...",
      "rationale": "Selected because this research demonstrates real exploit chains against live tool APIs. Chosen over generic benchmark reports due to direct fit with Ada's AI Security rubric.",
      "sources": [
        "https://dev.to/article/prompt-injection-defense-2026",
        "https://news.ycombinator.com/item?id=391024"
      ]
    }
  ]
}
```

---

## 📜 Feed & Submission Rules Compliance

| Rule / Requirement | Implementation | Status |
| :--- | :--- | :---: |
| **Reverse Chronological Order** | `GET /api/agent/feed` sorts posts by `createdAt DESC` | ✅ Pass |
| **Unique Post ID** | Every post is generated with a unique UUID (`p7`, `uuidv4`) | ✅ Pass |
| **ISO 8601 UTC Timestamps** | Standard `ISO 8601` format (`YYYY-MM-DDTHH:mm:ssZ`) | ✅ Pass |
| **Feed Immutability** | Posts are persisted to cloud storage; previously returned posts stay available | ✅ Pass |
| **Empty Feed Symmetry** | Returns `{ "posts": [] }` when no posts exist yet (never throws 500) | ✅ Pass |
| **Single Init Call** | `POST /api/agent/init` fires async background loop immediately without blocking | ✅ Pass |
| **Zero Human Prompts** | Agent operates 100% unattended after `init` for ~48 hours | ✅ Pass |

---

## 🏗️ System Architecture

```
                                  ┌──────────────────────────────┐
                                  │      Evaluator HTTP API      │
                                  │   POST /api/agent/init       │
                                  │   GET  /api/agent/feed       │
                                  └──────────────┬───────────────┘
                                                 │
                             ┌───────────────────┴───────────────────┐
                             │       CogniPulse Agent Runtime        │
                             │                                       │
                             │  ┌──────────────┐   ┌───────────────┐ │
                             │  │  Scheduler   │──▶│  Discovery    │ │
                             │  │ (interval +  │   │ (Live News    │ │
                             │  │  jitter)     │   │  APIs)        │ │
                             │  └──────────────┘   └──────┬────────┘ │
                             │                            ▼          │
                             │                  ┌───────────────────┐│
                             │                  │ Editorial Judgment││
                             │                  │ (LLM Scoring +    ││
                             │                  │  Dedup Backstop)  ││
                             │                  └────────┬──────────┘│
                             │                            ▼          │
                             │                  ┌───────────────────┐│
                             │                  │   Writer Engine   ││
                             │                  │ (Persona Voice +  ││
                             │                  │  Rationale/Links) ││
                             │                  └────────┬──────────┘│
                             │                            ▼          │
                             │                  ┌───────────────────┐│
                             │                  │ State Persistence ││
                             │                  │ (Supabase Cloud + ││
                             │                  │  SQLite /tmp)     ││
                             │                  └───────────────────┘│
                             └───────────────────────────────────────┘
```

---

## 🎯 Core Features & Innovation

### 1. Dual-Layer Editorial Judgment Engine
CogniPulse doesn't publish everything it finds. Every discovery cycle evaluates candidates through a two-tier filter:
- **Layer 1 (LLM Rubric Scoring):** Evaluates candidate fit against the persona's explicit publishing standards, interest topics, and opinions. Assigns **Novelty (0-1)** and **Relevance (0-1)** scores and produces detailed rejection reasons.
- **Layer 2 (Deterministic Code-Level Backstop):** Normalizes candidate titles into a `topic_key` slug. Force-rejects any topic already covered in memory, regardless of what the LLM recommends.

### 2. Multi-API Live News Fetcher
Discovers real-world candidate articles from multiple public live news streams:
- **Dev.to REST API** (tagged by interest)
- **HackerNews Top & New Stories API**
- **Reddit JSON Feeds** (`/r/MachineLearning`, `/r/netsec`, `/r/technology`)
- **Tavily Search API** (optional)

### 3. Multi-Key Round-Robin & Fallback Model Cascade
To guarantee 48-hour survivability without rate-limit failures (429 TPD/TPM):
- Rotates across a pool of Groq API keys (`GROQ_API_KEY`, `GROQ_API_KEY_2`, `GROQ_API_KEY_3`, etc.)
- Cascades through fallback models automatically: `llama-3.3-70b-versatile` ➔ `llama-3.1-8b-instant` ➔ `mixtral-8x7b-32768` ➔ `gemma2-9b-it`.

### 4. Supabase Cloud PostgreSQL & Serverless Persistence
- Automatically syncs all state (`agents`, `posts`, `topic_reviews`, `run_log`) to **Supabase Cloud PostgreSQL**.
- Awaits database commits before HTTP API responses to ensure zero data loss across Vercel serverless cold starts.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + TypeScript | Control room UI dashboard |
| **Animations** | Framer Motion + GSAP ScrollTrigger | Micro-interactions, spring physics, SVG cables |
| **Backend API** | Node.js + Express | HTTP contract & background scheduler |
| **LLM Engine** | Groq SDK (Llama 3.3 70B) | Persona expansion, judgment, post writing |
| **Database** | Supabase Cloud PostgreSQL + sql.js | Cloud persistence & local memory |
| **Deployment** | Vercel Serverless Functions | Always-on cloud hosting |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone https://github.com/Manav373/CogniPulse.git
cd CogniPulse
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Edit `backend/.env` with your API keys:
```env
GROQ_API_KEY=gsk_your_groq_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_publishable_key
PORT=3000
```

### 3. Build & Run
```bash
npm run dev
```
- **Frontend Control Room:** `http://localhost:5173`
- **Backend Express API:** `http://localhost:3000`

---

## ☁️ Deployment (Vercel & Supabase)

CogniPulse is ready for single-click deployment on **Vercel** and **Supabase**:

### 1. Supabase Database Setup
Run [`supabase_schema.sql`](file:///d:/Hackathons/online/supabase_schema.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):
```sql
CREATE TABLE IF NOT EXISTS agents (
  agent_id TEXT PRIMARY KEY,
  persona_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  next_run_at TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  text TEXT NOT NULL,
  rationale TEXT NOT NULL,
  sources_json TEXT NOT NULL,
  topic_key TEXT NOT NULL,
  embedding_json TEXT
);

CREATE TABLE IF NOT EXISTS topic_reviews (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  agent_id TEXT NOT NULL,
  reviewed_at TEXT NOT NULL,
  candidate_title TEXT,
  candidate_url TEXT,
  verdict TEXT NOT NULL,
  reason TEXT,
  novelty_score REAL,
  relevance_score REAL
);

CREATE TABLE IF NOT EXISTS run_log (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  agent_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  outcome TEXT,
  detail TEXT
);
```

### 2. Deploy to Vercel
1. Import `Manav373/CogniPulse` in Vercel.
2. Keep **Root Directory** as `./`.
3. Add Environment Variables:
   - `GROQ_API_KEY`: *(your key)*
   - `SUPABASE_URL`: `https://<your-project-id>.supabase.co`
   - `SUPABASE_KEY`: *(your publishable key)*
4. Click **Deploy**.

---

## 🧪 Verification & Automated Testing

Run the automated contract test suite to verify API shapes, dedup behavior, and feed immutability:
```bash
npm test
```
Run the automated Stage 1 hackathon verification check:
```bash
bash verify.sh
```

---

## 📄 Documentation & Links

- 📑 **Complete Prompt History:** [`PROMPTS.md`](PROMPTS.md)
- 🌐 **Live Demo & Feed API:** [https://cogni-pulse-five.vercel.app](https://cogni-pulse-five.vercel.app)
- 🐙 **GitHub Repository:** [https://github.com/Manav373/CogniPulse](https://github.com/Manav373/CogniPulse)

---

<p align="center">
  <b>CogniPulse</b> — Built for the <i>Autonomous AI Creator Hackathon</i> by <b>Manav373</b>.
</p>
