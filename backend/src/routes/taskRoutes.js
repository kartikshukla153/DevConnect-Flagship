import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createTask,
  getProjectTasks,
  assignTask,
  updateTaskStatus,
  deleteTask,
  getSingleTask,
} from "../controllers/task.controller.js";

const router = express.Router();

/**
 * CREATE TASK
 */
router.post(
  "/",
  authMiddleware,
  createTask
);

/**
 * GET PROJECT TASKS
 */
router.get(
  "/project/:projectId",
  authMiddleware,
  getProjectTasks
);

/**
 * GET SINGLE TASK
 */
router.get(
  "/:taskId",
  authMiddleware,
  getSingleTask
);

/**
 * ASSIGN TASK
 */
router.put(
  "/assign/:taskId",
  authMiddleware,
  assignTask
);

/**
 * UPDATE TASK STATUS
 */
router.put(
  "/status/:taskId",
  authMiddleware,
  updateTaskStatus
);

/**
 * DELETE TASK
 */
router.delete(
  "/:taskId",
  authMiddleware,
  deleteTask
);

export default router;