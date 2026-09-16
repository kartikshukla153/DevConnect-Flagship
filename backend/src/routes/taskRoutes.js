import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import checkProjectRole from "../middleware/projectPermissionMiddleware.js";

import {
  createTask,
  getProjectTasks,
  assignTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getSingleTask,
  reviewTaskSubmission,
  submitTask,
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
  checkProjectRole("owner", "admin", "member"),
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
 * UPDATE TASK
 *
 * Updates core task information:
 * - title
 * - description
 * - priority
 * - deadline
 */
router.put(
  "/:taskId",
  authMiddleware,
  updateTask
);

/**
 * SUBMIT TASK
 */
router.post(
  "/submit/:taskId",
  authMiddleware,
  submitTask
);

/**
 * REVIEW TASK SUBMISSION
 */
router.put(
  "/review/:taskId",
  authMiddleware,
  reviewTaskSubmission
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