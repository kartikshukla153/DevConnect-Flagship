import Notification from "../models/Notification.js";
import { getIO, getReceiverSocketId } from "../socket/socket.js";

/**
 * SEND REAL-TIME NOTIFICATION
 */
export const sendRealtimeNotification = async (
  recipient,
  notification
) => {
  try {
    // Save notification first
    const savedNotification = await Notification.create(notification);

    const receiverSocketId = getReceiverSocketId(
      recipient.toString()
    );

    if (receiverSocketId) {
      getIO()
        .to(receiverSocketId)
        .emit("newNotification", savedNotification);

      console.log(
        `✅ Notification sent to socket ${receiverSocketId}`
      );
    }

    return savedNotification;
  } catch (error) {
    console.error("Notification Error:", error);
  }
};

/**
 * GET MY NOTIFICATIONS
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * MARK SINGLE NOTIFICATION AS READ
 */
export const markNotificationRead = async (
  req,
  res
) => {
  try {
    const notification = await Notification.findById(
      req.params.notificationId
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    if (
      notification.recipient.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    notification.read = true;

    await notification.save();

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * MARK ALL NOTIFICATIONS AS READ
 */
export const markAllNotificationsRead = async (
  req,
  res
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        read: false,
      },
      {
        read: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET UNREAD COUNT
 */
export const getUnreadNotificationCount =
  async (req, res) => {
    try {
      const count = await Notification.countDocuments({
        recipient: req.user._id,
        read: false,
      });

      return res.status(200).json({
        success: true,
        unreadCount: count,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };