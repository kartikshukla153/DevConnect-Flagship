import express from "express";
console.log("✅ conversationRoutes loaded");

import authMiddleware from "../middleware/authMiddleware.js";
console.log("conversationRoutes.js loaded");

import {
  createOrGetConversation,
  getMyConversations,
  getConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

/**
 * CREATE OR GET CONVERSATION
 */
router.post(
  "/:userId",
  authMiddleware,
  createOrGetConversation
);

/**
 * GET MY CONVERSATIONS
 */
router.get(
  "/",
  authMiddleware,
  getMyConversations
);

/**
 * GET SINGLE CONVERSATION
 */
router.get(
  "/:conversationId",
  authMiddleware,
  getConversation
);

export default router;