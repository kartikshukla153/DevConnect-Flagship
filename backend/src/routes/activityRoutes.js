import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getProjectActivity } from "../controllers/activity.controller.js";

const router = express.Router();

router.get(
  "/:projectId",
  authMiddleware,
  getProjectActivity
);

export default router;