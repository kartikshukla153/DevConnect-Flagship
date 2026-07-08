import Notification from "../models/Notification.js";
import {
  getIO,
  getReceiverSocketId,
} from "../socket/socket.js";

const createNotification = async ({
  recipient,
  sender,
  type,
  message,
  relatedPost = null,
  relatedProject = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      relatedPost,
      relatedProject,
    });

    const receiverSocketId = getReceiverSocketId(
      recipient.toString()
    );

    if (receiverSocketId) {
      getIO()
        .to(receiverSocketId)
        .emit("newNotification", notification);
    }

    return notification;
  } catch (error) {
    console.log(
      "Notification Creation Error:",
      error.message
    );
  }
};

export default createNotification;