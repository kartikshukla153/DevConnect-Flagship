import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendMessage,
  getMessages,
  markConversationAsRead,
  getUnreadCount,
  editMessage,
  deleteMessage,
  reactToMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.post(
  "/:conversationId",
  authMiddleware,
  sendMessage
);

router.get(
  "/:conversationId",
  authMiddleware,
  getMessages
);

router.put(
  "/read/:conversationId",
  authMiddleware,
  markConversationAsRead
);

router.get(
  "/unread/count",
  authMiddleware,
  getUnreadCount
);

router.put(
  "/edit/:messageId",
  authMiddleware,
  editMessage
);

router.delete(
  "/:messageId",
  authMiddleware,
  deleteMessage
);

router.put(
  "/reaction/:messageId",
  authMiddleware,
  reactToMessage
);

export default router;