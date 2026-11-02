import express from "express";
import { aiRateLimiter } from "../middleware/rateLimiter.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { reviewCode } from "../controllers/ai/review.controller.js";

const router = express.Router();

router.post(
  "/review",
  authMiddleware,
  aiRateLimiter,
  reviewCode
);

export default router;