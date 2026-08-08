import request from "supertest";
import express from "express";
import * as db from "../src/db";
import { Agent, Post } from "../src/types";
import * as fs from "fs";

// Mock app
const app = express();
app.use(express.json());

// Test helper to setup routes
function setupRoutes() {
  app.post("/api/agent/init", async (req, res) => {
    const { persona } = req.body;
    if (!persona?.name || !persona?.domain) {
      return res.status(400).json({ error: "Missing persona.name or persona.domain" });
    }
    // Mock persona generation for testing
    const agentId = "test-agent-" + Date.now();
    const agent: Agent = {
      agentId,
      persona: {
        name: persona.name,
        domain: persona.domain,
        bio: "Test bio",
        voice: { tone: "test", sentenceStyle: "test", personPOV: "first" },
        interests: ["topic1", "topic2"],
        opinions: ["opinion1"],
        publishingStandards: ["standard1"],
      },
      status: "active",
      createdAt: new Date().toISOString(),
    };
    db.saveAgent(agent);
    res.json({ agentId });
  });

  app.get("/api/agent/feed", (req, res) => {
    const { agentId } = req.query;
    if (!agentId || typeof agentId !== "string") {
      return res.status(400).json({ error: "Missing agentId" });
    }
    const agent = db.getAgent(agentId);
    if (!agent) {
      return res.json({ posts: [] });
    }
    const posts = db.getPosts(agentId);
    res.json({
      posts: posts.map((p) => ({
        id: p.id,
        createdAt: p.createdAt,
        text: p.text,
        rationale: p.rationale,
        sources: p.sources,
      })),
    });
  });
}

describe("API Contract", () => {
  beforeAll(async () => {
    await db.initDb("./test-agent.db");
    setupRoutes();
  });

  afterAll(() => {
    if (fs.existsSync("./test-agent.db")) {
      fs.unlinkSync("./test-agent.db");
    }
  });

  it("POST /api/agent/init returns agentId", async () => {
    const response = await request(app)
      .post("/api/agent/init")
      .send({ persona: { name: "Test", domain: "Testing" } });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("agentId");
    expect(typeof response.body.agentId).toBe("string");
  });

  it("POST /api/agent/init returns 400 for missing name", async () => {
    const response = await request(app)
      .post("/api/agent/init")
      .send({ persona: { domain: "Testing" } });

    expect(response.status).toBe(400);
  });

  it("GET /api/agent/feed returns correct shape", async () => {
    const initRes = await request(app)
      .post("/api/agent/init")
      .send({ persona: { name: "Test2", domain: "Testing2" } });

    const agentId = initRes.body.agentId;

    const feedRes = await request(app).get(`/api/agent/feed?agentId=${agentId}`);

    expect(feedRes.status).toBe(200);
    expect(feedRes.body).toHaveProperty("posts");
    expect(Array.isArray(feedRes.body.posts)).toBe(true);
  });

  it("GET /api/agent/feed returns empty posts for unknown agent", async () => {
    const response = await request(app).get("/api/agent/feed?agentId=unknown");

    expect(response.status).toBe(200);
    expect(response.body.posts).toEqual([]);
  });

  it("Feed returns newest-first ordering", async () => {
    const initRes = await request(app)
      .post("/api/agent/init")
      .send({ persona: { name: "Test3", domain: "Testing3" } });

    const agentId = initRes.body.agentId;

    // Add test posts
    const post1: Post = {
      id: "p1",
      agentId,
      createdAt: new Date("2026-08-01").toISOString(),
      text: "First post",
      rationale: "Test",
      sources: ["http://example.com"],
      topicKey: "topic1",
    };

    const post2: Post = {
      id: "p2",
      agentId,
      createdAt: new Date("2026-08-02").toISOString(),
      text: "Second post",
      rationale: "Test",
      sources: ["http://example.com"],
      topicKey: "topic2",
    };

    db.savePost(post1);
    db.savePost(post2);

    const feedRes = await request(app).get(`/api/agent/feed?agentId=${agentId}`);

    expect(feedRes.body.posts.length).toBe(2);
    expect(feedRes.body.posts[0].id).toBe("p2"); // newest first
    expect(feedRes.body.posts[1].id).toBe("p1");
  });

  it("Dedup works with topic_key", async () => {
    const initRes = await request(app)
      .post("/api/agent/init")
      .send({ persona: { name: "Test4", domain: "Testing4" } });

    const agentId = initRes.body.agentId;
    const topicKey = "duplicate-topic";

    const post1: Post = {
      id: "p3",
      agentId,
      createdAt: new Date().toISOString(),
      text: "Original",
      rationale: "Test",
      sources: ["http://example.com"],
      topicKey,
    };

    db.savePost(post1);

    const exists = db.topicExists(agentId, topicKey);
    expect(exists).toBe(true);

    const nonExists = db.topicExists(agentId, "different-key");
    expect(nonExists).toBe(false);
  });
});
