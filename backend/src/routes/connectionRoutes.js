import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  cancelConnectionRequest,
  getPendingRequests,
  getMyConnections,
  removeConnection,
  getConnectionStatus,
} from "../controllers/connectionController.js";

const router = express.Router();

/**
 * ==========================
 * SEND CONNECTION REQUEST
 * ==========================
 */
router.post(
  "/request/:userId",
  authMiddleware,
  sendConnectionRequest
);

/**
 * ==========================
 * ACCEPT CONNECTION REQUEST
 * ==========================
 */
router.post(
  "/accept/:userId",
  authMiddleware,
  acceptConnectionRequest
);

/**
 * ==========================
 * REJECT CONNECTION REQUEST
 * ==========================
 */
router.post(
  "/reject/:userId",
  authMiddleware,
  rejectConnectionRequest
);

/**
 * ==========================
 * CANCEL SENT REQUEST
 * ==========================
 */
router.delete(
  "/cancel/:userId",
  authMiddleware,
  cancelConnectionRequest
);

/**
 * ==========================
 * GET CONNECTION STATUS
 * ==========================
 */
router.get(
  "/status/:userId",
  authMiddleware,
  getConnectionStatus
);

/**
 * ==========================
 * GET PENDING REQUESTS
 * ==========================
 */
router.get(
  "/pending",
  authMiddleware,
  getPendingRequests
);

/**
 * ==========================
 * GET MY CONNECTIONS
 * ==========================
 */
router.get(
  "/my-connections",
  authMiddleware,
  getMyConnections
);

/**
 * ==========================
 * REMOVE CONNECTION
 * ==========================
 */
router.delete(
  "/remove/:userId",
  authMiddleware,
  removeConnection
);

export default router;