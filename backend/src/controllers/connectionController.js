import User from "../models/User.js";
import createNotification from "../utils/createNotification.js";

/**
 * SEND CONNECTION REQUEST
 */
export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself",
      });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const alreadyConnected = sender.connections.some(
      (id) => id.toString() === receiverId
    );

    if (alreadyConnected) {
      return res.status(400).json({
        success: false,
        message: "Already connected",
      });
    }

    const requestAlreadySent = receiver.connectionRequests.some(
      (id) => id.toString() === senderId.toString()
    );

    if (requestAlreadySent) {
      return res.status(400).json({
        success: false,
        message: "Request already sent",
      });
    }

    receiver.connectionRequests.push(senderId);

    await receiver.save();

    await createNotification({
      recipient: receiverId,
      sender: senderId,
      type: "connection_request",
      message: `${sender.name} sent you a connection request`,
    });

    return res.status(200).json({
      success: true,
      message: "Connection request sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ACCEPT CONNECTION REQUEST
 */
export const acceptConnectionRequest = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const requesterId = req.params.userId;

    const currentUser = await User.findById(currentUserId);
    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requestExists = currentUser.connectionRequests.some(
      (id) => id.toString() === requesterId
    );

    if (!requestExists) {
      return res.status(400).json({
        success: false,
        message: "No request found",
      });
    }

    currentUser.connections.push(requesterId);
    requester.connections.push(currentUserId);

    currentUser.connectionRequests =
      currentUser.connectionRequests.filter(
        (id) => id.toString() !== requesterId
      );

    await currentUser.save();
    await requester.save();

    await createNotification({
      recipient: requesterId,
      sender: currentUserId,
      type: "connection_accepted",
      message: `${currentUser.name} accepted your connection request`,
    });

    return res.status(200).json({
      success: true,
      message: "Connection request accepted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET PENDING CONNECTION REQUESTS
 */
export const getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "connectionRequests",
      "name email profilePicture"
    );

    return res.status(200).json({
      success: true,
      count: user.connectionRequests.length,
      requests: user.connectionRequests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const requesterId = req.params.userId;

    const currentUser = await User.findById(req.user._id);
    const requester = await User.findById(requesterId);

    if (!requester) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requestExists = currentUser.connectionRequests.some(
      (id) => id.toString() === requesterId
    );

    if (!requestExists) {
      return res.status(400).json({
        success: false,
        message: "No request found",
      });
    }

    currentUser.connectionRequests =
      currentUser.connectionRequests.filter(
        (id) => id.toString() !== requesterId
      );

    await currentUser.save();

    await createNotification({
      recipient: requesterId,
      sender: currentUser._id,
      type: "connection_rejected",
      message: `${currentUser.name} rejected your connection request`,
    });

    return res.status(200).json({
      success: true,
      message: "Connection request rejected",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * CANCEL SENT CONNECTION REQUEST
 */
export const cancelConnectionRequest = async (req, res) => {
  try {
    const receiverId = req.params.userId;

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const requestExists = receiver.connectionRequests.some(
      (id) => id.toString() === req.user._id.toString()
    );

    if (!requestExists) {
      return res.status(400).json({
        success: false,
        message: "No sent request found",
      });
    }

    receiver.connectionRequests =
      receiver.connectionRequests.filter(
        (id) => id.toString() !== req.user._id.toString()
      );

    await receiver.save();

    return res.status(200).json({
      success: true,
      message: "Connection request cancelled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET MY CONNECTIONS
 */
export const getMyConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "connections",
      "name email profilePicture bio skills"
    );

    return res.status(200).json({
      success: true,
      count: user.connections.length,
      connections: user.connections,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const connectionId = req.params.userId;

    const currentUser = await User.findById(req.user._id);
    const connectionUser = await User.findById(connectionId);

    if (!connectionUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    currentUser.connections = currentUser.connections.filter(
      (id) => id.toString() !== connectionId
    );

    connectionUser.connections = connectionUser.connections.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await connectionUser.save();

    await createNotification({
      recipient: connectionUser._id,
      sender: currentUser._id,
      type: "connection_removed",
      message: `${currentUser.name} removed you from their connections`,
    });

    return res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/**
 * GET CONNECTION STATUS
 */
export const getConnectionStatus = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const targetUser = await User.findById(req.params.userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (currentUser._id.toString() === targetUser._id.toString()) {
      return res.status(200).json({
        success: true,
        status: "self",
      });
    }

    const connected = currentUser.connections.some(
      (id) => id.toString() === targetUser._id.toString()
    );

    if (connected) {
      return res.status(200).json({
        success: true,
        status: "connected",
      });
    }

    const requestSent = targetUser.connectionRequests.some(
      (id) => id.toString() === currentUser._id.toString()
    );

    if (requestSent) {
      return res.status(200).json({
        success: true,
        status: "pending",
      });
    }

    const requestReceived = currentUser.connectionRequests.some(
      (id) => id.toString() === targetUser._id.toString()
    );

    if (requestReceived) {
      return res.status(200).json({
        success: true,
        status: "received",
      });
    }

    return res.status(200).json({
      success: true,
      status: "none",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};