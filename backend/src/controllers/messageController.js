import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

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
    if (
      participant.toString() ===
      senderId.toString()
    )
      return;

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
    const { conversationId } = req.params;
    const { text, replyTo } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

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
        message: "You are not a participant of this conversation",
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      text: text.trim(),
      replyTo: replyTo || null,
      readBy: [senderId],
    });

    conversation.lastMessage = message._id;
    conversation.lastMessageText = text.trim();
    conversation.lastMessageSender = senderId;
    conversation.lastMessageAt = new Date();

    await conversation.save();

    const populatedMessage = await populateMessage(
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
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send Message Error:", error);

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

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
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