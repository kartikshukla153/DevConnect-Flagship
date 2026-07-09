import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createOrGetConversation,
  getConversation,
  getMyConversations,
  getSuggestedDevelopers,
} from "../controllers/conversationController.js";

const router = express.Router();

router.get(
  "/suggested",
  authMiddleware,
  getSuggestedDevelopers
);

router.post(
  "/:userId",
  authMiddleware,
  createOrGetConversation
);

router.get(
  "/",
  authMiddleware,
  getMyConversations
);

router.get(
  "/:conversationId",
  authMiddleware,
  getConversation
);

export default router;