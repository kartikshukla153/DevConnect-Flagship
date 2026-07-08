import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "../controllers/notificationController.js";

const router = express.Router();

/**
 * GET ALL NOTIFICATIONS
 */
router.get(
  "/",
  authMiddleware,
  getMyNotifications
);

/**
 * UNREAD COUNT
 */
router.get(
  "/unread-count",
  authMiddleware,
  getUnreadNotificationCount
);

/**
 * MARK SINGLE READ
 */
router.put(
  "/read/:notificationId",
  authMiddleware,
  markNotificationRead
);

/**
 * MARK ALL READ
 */
router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsRead
);

export default router;