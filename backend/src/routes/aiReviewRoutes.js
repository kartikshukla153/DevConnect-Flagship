import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { reviewCode } from "../controllers/ai/review.controller.js";

const router = express.Router();

router.post(
  "/review",
  authMiddleware,
  reviewCode
);

export default router;