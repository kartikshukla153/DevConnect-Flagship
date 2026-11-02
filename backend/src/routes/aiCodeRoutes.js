import express from "express";
import { aiRateLimiter } from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateCode } from "../controllers/ai/generateCode.controller.js";

const router = express.Router();

router.post(
  "/generate",
  authMiddleware,
  aiRateLimiter,
  generateCode
);

export default router;