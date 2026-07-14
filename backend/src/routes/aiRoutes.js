import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import { generateRoadmap } from "../controllers/ai/generateRoadmap.controller.js";
import { getWorkspace } from "../controllers/ai/getWorkspace.controller.js";
import { chatWithProject } from "../controllers/ai/chat.controller.js";

const router = express.Router();

router.post(
  "/generate-roadmap",
  authMiddleware,
  generateRoadmap
);

router.get(
  "/workspace/:projectId",
  authMiddleware,
  getWorkspace
);

router.post(
  "/chat",
  (req, res, next) => {
    console.log("🔥 /api/ai/chat ROUTE HIT");
    next();
  },
  authMiddleware,
  chatWithProject
);

export default router;