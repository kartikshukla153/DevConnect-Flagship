import express from "express";
import { aiRateLimiter } from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { chatWithProject } from "../controllers/ai/chat.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  aiRateLimiter,
  chatWithProject
);

export default router;