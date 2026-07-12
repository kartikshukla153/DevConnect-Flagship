import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import { generateRoadmap } from "../controllers/ai/generateRoadmap.controller.js";
import { getWorkspace } from "../controllers/ai/getWorkspace.controller.js";

const router = express.Router();

/*
========================================
AI Project Architect
========================================
*/

router.post(
  "/generate-roadmap",
  authMiddleware,
  generateRoadmap
);

/*
========================================
AI Workspace
========================================
*/

router.get(
  "/workspace/:projectId",
  authMiddleware,
  getWorkspace
);

export default router;