import express from "express";
import { aiRateLimiter } from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateDocs } from "../controllers/ai/generateDocs.controller.js";

const router = express.Router();

router.post(
  "/generate",
  authMiddleware,
  aiRateLimiter,
  generateDocs
);

export default router;