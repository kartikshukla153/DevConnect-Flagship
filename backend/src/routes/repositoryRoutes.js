import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  connectRepository,
  getRepository,
  getRepositoryCommits,
  getRepositoryContributors,
  getRepositoryLanguages,
  getRepositoryAnalytics,
} from "../controllers/repositoryController.js";

const router = express.Router();

router.post(
  "/:projectId/connect",
  authMiddleware,
  connectRepository
);

router.get(
  "/:projectId",
  authMiddleware,
  getRepository
);
router.get(
  "/:projectId/commits",
  authMiddleware,
  getRepositoryCommits
);
router.get(
  "/:projectId/contributors",
  authMiddleware,
  getRepositoryContributors
);
router.get(
  "/:projectId/languages",
  authMiddleware,
  getRepositoryLanguages
);

router.get(
  "/:projectId/analytics",
  authMiddleware,
  getRepositoryAnalytics
);

export default router;
