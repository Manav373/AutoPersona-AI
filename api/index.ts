import express from "express";
import cors from "cors";
import { router as apiRouter } from "../backend/src/routes/api";
import { ensureDbInitialized } from "../backend/src/db";

const app = express();

app.use(cors());
app.use(express.json());

// Ensure database is initialized before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDbInitialized();
    next();
  } catch (error) {
    console.error("Database initialization error:", error);
    res.status(500).json({ error: "Failed to initialize database" });
  }
});

app.use(apiRouter);

export default app;
