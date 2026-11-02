import express from "express";
import { aiRateLimiter } from "../middleware/rateLimiter.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { fixBug } from "../controllers/ai/bugFix.controller.js";

const router = express.Router();

router.post(
  "/fix",
  authMiddleware,
  aiRateLimiter,
  fixBug
);

export default router;