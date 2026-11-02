import express from "express";
import { aiRateLimiter } from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { summarizeChat } from "../controllers/ai/chatSummary.controller.js";

const router = express.Router();

// POST /api/ai-summary/chat
router.post(
  "/chat",
  authMiddleware,
  aiRateLimiter,
  summarizeChat
);

export default router;