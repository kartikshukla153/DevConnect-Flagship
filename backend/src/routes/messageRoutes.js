import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendMessage,
  getMessages,
  markConversationAsRead,
  getUnreadCount,
} from "../controllers/messageController.js";

const router = express.Router();

/**
 * SEND MESSAGE
 */
router.post(
  "/:conversationId",
  authMiddleware,
  sendMessage
);

/**
 * GET MESSAGES
 */
router.get(
  "/:conversationId",
  authMiddleware,
  getMessages
);

/**
 * MARK AS READ
 */
router.put(
  "/read/:conversationId",
  authMiddleware,
  markConversationAsRead
);

/**
 * GET TOTAL UNREAD COUNT
 */
router.get(
  "/unread/count",
  authMiddleware,
  getUnreadCount
);

export default router;