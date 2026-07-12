import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import {
  getIO,
  getReceiverSocketId,
} from "../socket/socket.js";

/**
 * ==========================================
 * MESSAGE POPULATION
 * ==========================================
 */

const populateMessage = (query) =>
  query
    .populate(
      "sender",
      "name email profilePicture"
    )
    .populate({
      path: "replyTo",
      populate: {
        path: "sender",
        select: "name",
      },
    });

/**
 * ==========================================
 * EMIT TO CONVERSATION PARTICIPANTS
 * ==========================================
 */

const emitToParticipants = (
  conversation,
  senderId,
  event,
  payload
) => {
  const io = getIO();

  conversation.participants.forEach((participant) => {
    const socketId = getReceiverSocketId(
      participant.toString()
    );

    if (socketId) {
      io.to(socketId).emit(event, payload);
    }
  });
};
 /*** ==========================================
 * SEND MESSAGE
 * ==========================================
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    console.log("\n========== SEND MESSAGE ==========");
console.log("Headers:", req.headers["content-type"]);
console.log("Body:", req.body);
console.log("File:", req.file);
console.log("==================================");
    const { conversationId } = req.params;
    const { text, replyTo } = req.body;
    console.log("\n========== NEW MESSAGE ==========");
console.log("Body:", req.body);
console.log("File:", req.file);
console.log("Headers:", req.headers["content-type"]);
console.log("=================================\n");

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) =>
        participant.toString() === senderId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let attachment = {
      url: "",
      publicId: "",
      originalName: "",
      mimeType: "",
      size: 0,
    };

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file);
console.log("===== CLOUDINARY RESPONSE =====");
console.log(uploaded);
console.log("===============================");
      attachment = {
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      };
    }

    if (
      (!text || !text.trim()) &&
      !attachment.url
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message must contain text or attachment",
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      text: text?.trim() || "",
      attachment,
      replyTo: replyTo || null,
      readBy: [senderId],
    });

    conversation.lastMessage = message._id;

    if (attachment.url) {
  if (attachment.mimeType.startsWith("audio/")) {
    conversation.lastMessageText = "🎤 Voice Message";
  } else if (attachment.mimeType.startsWith("image/")) {
    conversation.lastMessageText = "🖼️ Image";
  } else if (attachment.mimeType.startsWith("video/")) {
    conversation.lastMessageText = "🎥 Video";
  } else {
    conversation.lastMessageText = "📎 Attachment";
  }
} else {
  conversation.lastMessageText = message.text;
}

    conversation.lastMessageSender = senderId;
    conversation.lastMessageAt = new Date();

    await conversation.save();

    const populatedMessage =
      await populateMessage(
        Message.findById(message._id)
      );

    emitToParticipants(
      conversation,
      senderId,
      "newMessage",
      populatedMessage
    );

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/**
 * ==========================================
 * GET MESSAGES
 * ==========================================
 */

export const getMessages = async (req, res) => {

  try {

    const { conversationId } = req.params;

    const conversation =
      await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate(
        "sender",
        "name email profilePicture"
      )
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "name",
        },
      })
      .sort({
        createdAt: 1,
      });

    return res.status(200).json({
      success: true,
      messages,
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/**
 * ==========================================
 * EDIT MESSAGE
 * ==========================================
 */
export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.deleted) {
      return res.status(400).json({
        success: false,
        message: "Deleted messages cannot be edited",
      });
    }

    if (
      message.sender.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    message.text = text.trim();
    message.edited = true;

    await message.save();

    const populatedMessage = await populateMessage(
      Message.findById(message._id)
    );

    const conversation = await Conversation.findById(
      message.conversation
    );

    emitToParticipants(
      conversation,
      req.user._id,
      "messageUpdated",
      populatedMessage
    );

    return res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: populatedMessage,
    });

  } catch (error) {

    console.error("Edit Message Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

    

/**
 * DELETE MESSAGE
 */

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (
      message.sender.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    message.deleted = true;
    message.text = "This message was deleted";
    message.reactions = [];

    await message.save();

    const populatedMessage = await populateMessage(
      Message.findById(message._id)
    );

    const conversation = await Conversation.findById(
      message.conversation
    );

    emitToParticipants(
      conversation,
      req.user._id,
      "messageDeleted",
      populatedMessage
    );

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: populatedMessage,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

/**
 * REACT TO MESSAGE
 */

export const reactToMessage = async (req, res) => {
  try {

    const { messageId } = req.params;
    const { emoji } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const existingReaction = message.reactions.find(
      (reaction) =>
        reaction.user.toString() ===
        req.user._id.toString()
    );

    if (existingReaction) {

      if (existingReaction.emoji === emoji) {

        message.reactions =
          message.reactions.filter(
            (reaction) =>
              reaction.user.toString() !==
              req.user._id.toString()
          );

      } else {

        existingReaction.emoji = emoji;

      }

    } else {

      message.reactions.push({
        user: req.user._id,
        emoji,
      });

    }

    await message.save();

    const populatedMessage = await populateMessage(
      Message.findById(message._id)
    );

    const conversation = await Conversation.findById(
      message.conversation
    );

    emitToParticipants(
      conversation,
      req.user._id,
      "messageReactionUpdated",
      populatedMessage
    );

    return res.status(200).json({
      success: true,
      message: "Reaction updated successfully",
      data: populatedMessage,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
/**
 * MARK CONVERSATION AS READ
 */

export const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: {
          $ne: req.user._id,
        },
        readBy: {
          $ne: req.user._id,
        },
      },
      {
        $push: {
          readBy: req.user._id,
        },
      }
    );

    const conversation = await Conversation.findById(
      conversationId
    );

    emitToParticipants(
      conversation,
      req.user._id,
      "messagesSeen",
      {
        conversationId,
        userId: req.user._id,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
/**
 * GET UNREAD COUNT
 */
export const getUnreadCount = async (req, res) => {
  try {

    const conversations = await Conversation.find({
      participants: req.user._id,
    });

    let unreadCount = 0;

    for (const conversation of conversations) {

      const count = await Message.countDocuments({
        conversation: conversation._id,
        sender: {
          $ne: req.user._id,
        },
        readBy: {
          $ne: req.user._id,
        },
      });

      unreadCount += count;
    }

    return res.status(200).json({
      success: true,
      unreadCount,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
export const searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { q } = req.query;

    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.participants.some(
        (id) =>
          id.toString() ===
          req.user._id.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      deleted: false,
      text: {
        $regex: q,
        $options: "i",
      },
    })
      .populate("sender", "name profilePicture")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      messages,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};