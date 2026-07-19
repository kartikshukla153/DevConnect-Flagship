import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "../controllers/taskComment.controller.js";

const router = express.Router();

router.get(
  "/:taskId",
  authMiddleware,
  getComments
);

router.post(
  "/:taskId",
  authMiddleware,
  createComment
);

router.put(
  "/:commentId",
  authMiddleware,
  updateComment
);

router.delete(
  "/:commentId",
  authMiddleware,
  deleteComment
);

export default router;