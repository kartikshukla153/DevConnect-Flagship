import mongoose from "mongoose";
import User from "../models/User.js";
import createNotification from "../utils/createNotification.js";

/**
 * ============================================================
 * CONNECTION CONTROLLER
 * ============================================================
 *
 * Connection lifecycle:
 *
 * NONE
 *   ├── send request ───────► PENDING
 *   └── receive request ────► RECEIVED
 *
 * PENDING
 *   └── cancel ──────────────► NONE
 *
 * RECEIVED
 *   ├── accept ──────────────► CONNECTED
 *   └── reject ──────────────► NONE
 *
 * CONNECTED
 *   └── remove ──────────────► NONE
 *
 * Design goals:
 * - Preserve the existing API contract.
 * - Prevent self-connections.
 * - Validate ObjectIds before database access.
 * - Keep both sides of a relationship consistent.
 * - Use transactions for multi-document mutations.
 * - Make connection mutations safe against duplicate requests.
 * - Never allow notification failure to roll back a connection.
 * - Avoid leaking unexpected internal errors to clients.
 * ============================================================
 */

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

/**
 * Validate MongoDB ObjectId.
 */
const isValidUserId = (id) => mongoose.isValidObjectId(id);

/**
 * Safely compare MongoDB ObjectIds / strings.
 */
const sameId = (a, b) => {
  if (!a || !b) return false;

  return a.toString() === b.toString();
};

/**
 * Create an expected application error.
 *
 * statusCode is intentionally attached so expected errors can be
 * returned to the client while unexpected internal errors remain
 * generic.
 */
const createAppError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  return error;
};

/**
 * Return a safe client-facing error message.
 *
 * Unexpected database/runtime errors should not be exposed.
 */
const getErrorMessage = (error, fallback) => {
  if (error?.statusCode && error?.message) {
    return error.message;
  }

  return fallback;
};

/**
 * Notifications are secondary to the connection mutation.
 *
 * If notification creation fails, the actual connection operation
 * should remain successful.
 */
const sendSafeNotification = async (payload) => {
  try {
    await createNotification(payload);
  } catch (error) {
    console.error("CONNECTION NOTIFICATION ERROR:", error);
  }
};

/**
 * ============================================================
 * SEND CONNECTION REQUEST
 * ============================================================
 *
 * POST /connections/request/:userId
 *
 * Current user -> target user
 */
export const sendConnectionRequest = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.userId;

  try {
    /**
     * Validate target ID before any database operation.
     */
    if (!isValidUserId(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /**
     * Prevent self-connections.
     */
    if (sameId(senderId, receiverId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself",
      });
    }

    const session = await mongoose.startSession();

    let sender = null;
    let shouldNotify = false;

    try {
      await session.withTransaction(async () => {
        sender = await User.findById(senderId).session(session);

        const receiver = await User.findById(receiverId).session(session);

        if (!sender) {
          throw createAppError(
            "Authenticated user not found",
            401
          );
        }

        if (!receiver) {
          throw createAppError(
            "User not found",
            404
          );
        }

        /**
         * Already connected?
         */
        const alreadyConnected = sender.connections.some((id) =>
          sameId(id, receiverId)
        );

        if (alreadyConnected) {
          throw createAppError(
            "Already connected",
            400
          );
        }

        /**
         * Check whether the target has already sent us a request.
         *
         * This prevents two opposite pending requests from
         * existing simultaneously.
         */
        const reverseRequestExists =
          sender.connectionRequests.some((id) =>
            sameId(id, receiverId)
          );

        if (reverseRequestExists) {
          throw createAppError(
            "This user has already sent you a connection request. Accept it instead.",
            400
          );
        }

        /**
         * Check whether this request already exists.
         */
        const requestAlreadySent =
          receiver.connectionRequests.some((id) =>
            sameId(id, senderId)
          );

        if (requestAlreadySent) {
          throw createAppError(
            "Request already sent",
            400
          );
        }

        /**
         * Add request only if it doesn't already exist.
         *
         * The query condition + $addToSet gives us protection
         * against accidental duplicate writes.
         */
        const updateResult = await User.updateOne(
          {
            _id: receiverId,
            connectionRequests: {
              $ne: senderId,
            },
          },
          {
            $addToSet: {
              connectionRequests: senderId,
            },
          },
          {
            session,
          }
        );

        /**
         * If another concurrent request won the race, don't
         * report this request as successfully created.
         */
        if (updateResult.modifiedCount !== 1) {
          throw createAppError(
            "Request already sent",
            400
          );
        }

        shouldNotify = true;
      });
    } finally {
      await session.endSession();
    }

    /**
     * Notification is deliberately outside the transaction.
     */
    if (shouldNotify && sender) {
      await sendSafeNotification({
        recipient: receiverId,
        sender: senderId,
        type: "connection_request",
        message: `${sender.name} sent you a connection request`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connection request sent",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
      console.error(
        "SEND CONNECTION REQUEST ERROR:",
        error
      );
    }

    return res.status(statusCode).json({
      success: false,
      message: getErrorMessage(
        error,
        "Unable to send connection request"
      ),
    });
  }
};

/**
 * ============================================================
 * ACCEPT CONNECTION REQUEST
 * ============================================================
 *
 * POST /connections/accept/:userId
 *
 * Current user accepts a request from requester.
 */
export const acceptConnectionRequest = async (req, res) => {
  const currentUserId = req.user._id;
  const requesterId = req.params.userId;

  try {
    if (!isValidUserId(requesterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (sameId(currentUserId, requesterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection request",
      });
    }

    const session = await mongoose.startSession();

    let currentUser = null;
    let shouldNotify = false;

    try {
      await session.withTransaction(async () => {
        currentUser = await User.findById(currentUserId).session(
          session
        );

        const requester = await User.findById(requesterId).session(
          session
        );

        if (!currentUser) {
          throw createAppError(
            "Authenticated user not found",
            401
          );
        }

        if (!requester) {
          throw createAppError(
            "User not found",
            404
          );
        }

        /**
         * The request must actually exist on the current user's
         * side.
         */
        const requestExists =
          currentUser.connectionRequests.some((id) =>
            sameId(id, requesterId)
          );

        if (!requestExists) {
          throw createAppError(
            "No request found",
            400
          );
        }

        /**
         * Add the relationship to both users and remove the
         * pending request.
         */
        const currentUserUpdate = await User.updateOne(
          {
            _id: currentUserId,
            connectionRequests: requesterId,
          },
          {
            $addToSet: {
              connections: requesterId,
            },
            $pull: {
              connectionRequests: requesterId,
            },
          },
          {
            session,
          }
        );

        /**
         * If the request disappeared between the read and update,
         * don't silently claim success.
         */
        if (currentUserUpdate.modifiedCount !== 1) {
          throw createAppError(
            "Connection request is no longer available",
            400
          );
        }

        await User.updateOne(
          {
            _id: requesterId,
          },
          {
            $addToSet: {
              connections: currentUserId,
            },
            $pull: {
              connectionRequests: currentUserId,
            },
          },
          {
            session,
          }
        );

        shouldNotify = true;
      });
    } finally {
      await session.endSession();
    }

    if (shouldNotify && currentUser) {
      await sendSafeNotification({
        recipient: requesterId,
        sender: currentUserId,
        type: "connection_accepted",
        message: `${currentUser.name} accepted your connection request`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connection request accepted",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
      console.error(
        "ACCEPT CONNECTION REQUEST ERROR:",
        error
      );
    }

    return res.status(statusCode).json({
      success: false,
      message: getErrorMessage(
        error,
        "Unable to accept connection request"
      ),
    });
  }
};

/**
 * ============================================================
 * GET PENDING CONNECTION REQUESTS
 * ============================================================
 *
 * GET /connections/pending
 */
export const getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("connectionRequests")
      .populate(
        "connectionRequests",
        "name email profilePicture bio skills location isOnline lastSeen"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /**
     * Deleted users can leave stale ObjectId references behind.
     * Filter null populated records before returning them.
     */
    const requests = user.connectionRequests.filter(Boolean);

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(
      "GET PENDING REQUESTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load pending connection requests",
    });
  }
};

/**
 * ============================================================
 * REJECT CONNECTION REQUEST
 * ============================================================
 *
 * POST /connections/reject/:userId
 */
export const rejectConnectionRequest = async (req, res) => {
  const currentUserId = req.user._id;
  const requesterId = req.params.userId;

  try {
    if (!isValidUserId(requesterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (sameId(currentUserId, requesterId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection request",
      });
    }

    const session = await mongoose.startSession();

    let currentUser = null;

    try {
      await session.withTransaction(async () => {
        currentUser = await User.findById(currentUserId).session(
          session
        );

        const requester = await User.findById(requesterId).session(
          session
        );

        if (!currentUser) {
          throw createAppError(
            "Authenticated user not found",
            401
          );
        }

        if (!requester) {
          throw createAppError(
            "User not found",
            404
          );
        }

        const requestExists =
          currentUser.connectionRequests.some((id) =>
            sameId(id, requesterId)
          );

        if (!requestExists) {
          throw createAppError(
            "No request found",
            400
          );
        }

        const updateResult = await User.updateOne(
          {
            _id: currentUserId,
            connectionRequests: requesterId,
          },
          {
            $pull: {
              connectionRequests: requesterId,
            },
          },
          {
            session,
          }
        );

        if (updateResult.modifiedCount !== 1) {
          throw createAppError(
            "Connection request is no longer available",
            400
          );
        }
      });
    } finally {
      await session.endSession();
    }

    await sendSafeNotification({
      recipient: requesterId,
      sender: currentUserId,
      type: "connection_rejected",
      message: `${currentUser.name} rejected your connection request`,
    });

    return res.status(200).json({
      success: true,
      message: "Connection request rejected",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
      console.error(
        "REJECT CONNECTION REQUEST ERROR:",
        error
      );
    }

    return res.status(statusCode).json({
      success: false,
      message: getErrorMessage(
        error,
        "Unable to reject connection request"
      ),
    });
  }
};

/**
 * ============================================================
 * CANCEL SENT CONNECTION REQUEST
 * ============================================================
 *
 * DELETE /connections/cancel/:userId
 */
export const cancelConnectionRequest = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.userId;

  try {
    if (!isValidUserId(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (sameId(senderId, receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection request",
      });
    }

    /**
     * Atomic removal:
     *
     * Only remove the request if the authenticated user is
     * actually present in the receiver's request list.
     */
    const updateResult = await User.updateOne(
      {
        _id: receiverId,
        connectionRequests: senderId,
      },
      {
        $pull: {
          connectionRequests: senderId,
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      const receiverExists = await User.exists({
        _id: receiverId,
      });

      if (!receiverExists) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(400).json({
        success: false,
        message: "No sent request found",
      });
    }

    if (updateResult.modifiedCount !== 1) {
      return res.status(400).json({
        success: false,
        message: "No sent request found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connection request cancelled successfully",
    });
  } catch (error) {
    console.error(
      "CANCEL CONNECTION REQUEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to cancel connection request",
    });
  }
};

/**
 * ============================================================
 * GET MY CONNECTIONS
 * ============================================================
 *
 * GET /connections/my-connections
 */
export const getMyConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("connections")
      .populate(
        "connections",
        "name email profilePicture bio skills location isOnline lastSeen"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /**
     * Protect the frontend from stale/deleted references.
     */
    const connections = user.connections.filter(Boolean);

    return res.status(200).json({
      success: true,
      count: connections.length,
      connections,
    });
  } catch (error) {
    console.error(
      "GET MY CONNECTIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load your connections",
    });
  }
};

/**
 * ============================================================
 * REMOVE CONNECTION
 * ============================================================
 *
 * DELETE /connections/remove/:userId
 *
 * Removes the relationship from both users.
 */
export const removeConnection = async (req, res) => {
  const currentUserId = req.user._id;
  const connectionId = req.params.userId;

  try {
    if (!isValidUserId(connectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (sameId(currentUserId, connectionId)) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove yourself as a connection",
      });
    }

    const session = await mongoose.startSession();

    let currentUser = null;
    let connectionUser = null;

    try {
      await session.withTransaction(async () => {
        currentUser = await User.findById(currentUserId).session(
          session
        );

        connectionUser = await User.findById(connectionId).session(
          session
        );

        if (!currentUser) {
          throw createAppError(
            "Authenticated user not found",
            401
          );
        }

        if (!connectionUser) {
          throw createAppError(
            "User not found",
            404
          );
        }

        const isConnected = currentUser.connections.some((id) =>
          sameId(id, connectionId)
        );

        if (!isConnected) {
          throw createAppError(
            "Connection not found",
            400
          );
        }

        /**
         * Remove from current user's connections.
         */
        const currentUserUpdate = await User.updateOne(
          {
            _id: currentUserId,
            connections: connectionId,
          },
          {
            $pull: {
              connections: connectionId,
            },
          },
          {
            session,
          }
        );

        if (currentUserUpdate.modifiedCount !== 1) {
          throw createAppError(
            "Connection no longer exists",
            400
          );
        }

        /**
         * Remove the reciprocal relationship.
         */
        await User.updateOne(
          {
            _id: connectionId,
          },
          {
            $pull: {
              connections: currentUserId,
            },
          },
          {
            session,
          }
        );
      });
    } finally {
      await session.endSession();
    }

    await sendSafeNotification({
      recipient: connectionUser._id,
      sender: currentUserId,
      type: "connection_removed",
      message: `${currentUser.name} removed you from their connections`,
    });

    return res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
      console.error(
        "REMOVE CONNECTION ERROR:",
        error
      );
    }

    return res.status(statusCode).json({
      success: false,
      message: getErrorMessage(
        error,
        "Unable to remove connection"
      ),
    });
  }
};

/**
 * ============================================================
 * GET CONNECTION STATUS
 * ============================================================
 *
 * GET /connections/status/:userId
 *
 * Returns:
 * - self
 * - connected
 * - pending
 * - received
 * - none
 */
export const getConnectionStatus = async (req, res) => {
  const currentUserId = req.user._id;
  const targetUserId = req.params.userId;

  try {
    if (!isValidUserId(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /**
     * One query for each user keeps the logic explicit and easy
     * to reason about.
     */
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId).select(
        "connections connectionRequests"
      ),
      User.findById(targetUserId).select(
        "connections connectionRequests"
      ),
    ]);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /**
     * Same account.
     */
    if (sameId(currentUser._id, targetUser._id)) {
      return res.status(200).json({
        success: true,
        status: "self",
      });
    }

    /**
     * Existing connection.
     */
    const connected = currentUser.connections.some((id) =>
      sameId(id, targetUser._id)
    );

    if (connected) {
      return res.status(200).json({
        success: true,
        status: "connected",
      });
    }

    /**
     * Current user already sent the request.
     *
     * Requests are stored on the receiver.
     */
    const requestSent = targetUser.connectionRequests.some((id) =>
      sameId(id, currentUser._id)
    );

    if (requestSent) {
      return res.status(200).json({
        success: true,
        status: "pending",
      });
    }

    /**
     * Current user received a request from the target.
     */
    const requestReceived = currentUser.connectionRequests.some(
      (id) => sameId(id, targetUser._id)
    );

    if (requestReceived) {
      return res.status(200).json({
        success: true,
        status: "received",
      });
    }

    /**
     * No relationship.
     */
    return res.status(200).json({
      success: true,
      status: "none",
    });
  } catch (error) {
    console.error(
      "GET CONNECTION STATUS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to determine connection status",
    });
  }
};