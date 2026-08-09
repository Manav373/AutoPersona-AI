import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import * as db from "../db";
import { generatePersona } from "../services/llm";
import { Agent } from "../types";
import { startScheduler, stopScheduler, runCycle } from "../services/scheduler";

export const router = Router();

// POST /api/agent/init - Hackathon Spec
router.post("/api/agent/init", async (req: Request, res: Response) => {
  try {
    const { persona } = req.body;

    if (!persona?.name || !persona?.domain) {
      return res.status(400).json({ error: "Missing persona.name or persona.domain" });
    }

    // Generate full persona
    const fullPersona = await generatePersona(persona.name, persona.domain);

    // Create agent with 'active' status and start autonomous scheduler immediately upon initialization
    const agentId = uuid();
    const agent: Agent = {
      agentId,
      persona: fullPersona,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    await db.saveAgent(agent);

    // Immediately start autonomous timer background cycle
    startScheduler(agentId);

    res.json({ agentId });
  } catch (error) {
    console.error("Error in init:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/agent/status - Manual Toggle Active / Stopped Status
router.post("/api/agent/status", async (req: Request, res: Response) => {
  try {
    const { agentId, status } = req.body;

    if (!agentId || (status !== "active" && status !== "stopped")) {
      return res.status(400).json({ error: "Invalid agentId or status parameter" });
    }

    const agent = db.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    agent.status = status;
    await db.saveAgent(agent);

    if (status === "active") {
      startScheduler(agentId);
    } else {
      stopScheduler(agentId);
    }

    res.json({ success: true, agentId, status });
  } catch (error) {
    console.error("Error updating agent status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/agent/feed - Hackathon Spec + All Agents support
router.get("/api/agent/feed", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.query;
    await db.syncFromSupabase();

    if (!agentId || agentId === "all" || typeof agentId !== "string") {
      const posts = db.getAllPosts();
      posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json({
        posts: posts.map((p) => ({
          id: String(p.id),
          createdAt: new Date(p.createdAt).toISOString(),
          text: p.text || "",
          rationale: p.rationale || "",
          sources: Array.isArray(p.sources) ? p.sources : [],
        })),
      });
    }

    const agent = db.getAgent(agentId);
    if (!agent) {
      return res.json({ posts: [] });
    }

    const posts = db.getPosts(agentId);
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const response = {
      posts: posts.map((p) => ({
        id: String(p.id),
        createdAt: new Date(p.createdAt).toISOString(),
        text: p.text || "",
        rationale: p.rationale || "",
        sources: Array.isArray(p.sources) ? p.sources : [],
      })),
    };

    res.json(response);
  } catch (error) {
    console.error("Error in feed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/agent/trigger - Manual Run Cycle
router.post("/api/agent/trigger", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.body;
    if (!agentId) {
      return res.status(400).json({ error: "Missing agentId" });
    }

    // Trigger immediate cycle asynchronously
    runCycle(agentId);
    res.json({ success: true, message: `Cycle triggered for agent ${agentId}` });
  } catch (error) {
    console.error("Error in trigger:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/agents - List all agents
router.get("/api/agents", async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const agents = db.getAllAgents();
    res.json({ agents });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats - System Statistics
router.get("/api/stats", async (req: Request, res: Response) => {
  try {
    await db.syncFromSupabase();
    const stats = db.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/logs - Execution logs & topic reviews
router.get("/api/logs", async (req: Request, res: Response) => {
  try {
    const { agentId } = req.query;
    await db.syncFromSupabase();
    const topicReviews = db.getTopicReviews(typeof agentId === "string" ? agentId : undefined);
    const runLogs = db.getRunLogs(typeof agentId === "string" ? agentId : undefined);
    res.json({ topicReviews, runLogs });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/reset - Clear all agents and generated data right now
router.post("/api/reset", async (req: Request, res: Response) => {
  try {
    stopScheduler();
    await db.clearAllData();
    res.json({ success: true, message: "All agents and generated data cleared successfully." });
  } catch (error) {
    console.error("Error clearing data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
