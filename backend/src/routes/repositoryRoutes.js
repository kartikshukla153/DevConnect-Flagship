import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  connectRepository,
  getRepository,
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

export default router;