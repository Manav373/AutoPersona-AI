import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

import express from "express";
import * as db from "./db";
import { router as apiRouter } from "./routes/api";
import { stopScheduler } from "./services/scheduler";

const app = express();
app.use(express.json());

// Serve static frontend build if present
const publicPath = path.join(__dirname, "../public");
app.use(express.static(publicPath));

// API Routes
app.use(apiRouter);

const PORT = parseInt(process.env.PORT || "3000", 10);
const DB_PATH = process.env.DATABASE_PATH || "./agent.db";

// Start server
async function main() {
  try {
    await db.initDb(DB_PATH);
    console.log("Database initialized");

    // Keep all agents stopped by default on server start to prevent token usage
    stopScheduler();
    console.log("⚡ Backend Ready: All agent schedulers paused by default (0 token usage until user activates via UI)");

    app.listen(PORT, () => {
      console.log(`🚀 Backend Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  stopScheduler();
  process.exit(0);
});

main();
