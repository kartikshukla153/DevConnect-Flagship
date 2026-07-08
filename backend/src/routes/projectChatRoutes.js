import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendProjectMessage,
  getProjectMessages,
} from "../controllers/projectChat.controller.js";

const router = express.Router();

/**
 * SEND PROJECT MESSAGE
 */
router.post(
  "/:projectId",
  authMiddleware,
  sendProjectMessage
);

/**
 * GET PROJECT CHAT
 */
router.get(
  "/:projectId",
  authMiddleware,
  getProjectMessages
);

export default router;