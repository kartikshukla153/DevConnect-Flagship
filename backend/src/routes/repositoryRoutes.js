import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  connectRepository,
  getRepository,
  getRepositoryCommits,
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

export default router;
