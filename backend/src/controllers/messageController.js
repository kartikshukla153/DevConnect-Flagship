import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

import {
  getIO,
  getReceiverSocketId,
} from "../socket/socket.js";

/**
 * SEND MESSAGE
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required",
      });
    }

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
        (participant) =>
          participant.toString() === senderId.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant of this conversation",
      });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: senderId,
      text,
      readBy: [senderId],
    });

    conversation.lastMessage = message._id;

    await conversation.save();

    const populatedMessage =
      await Message.findById(message._id).populate(
        "sender",
        "name email"
      );

    const receiver = conversation.participants.find(
      (id) =>
        id.toString() !== senderId.toString()
    );

    if (receiver) {
      const receiverSocketId =
        getReceiverSocketId(receiver.toString());

      if (receiverSocketId) {
        getIO()
          .to(receiverSocketId)
          .emit("newMessage", populatedMessage);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
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
 * GET MESSAGES
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const conversation =
      await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.participants.some(
        (participant) =>
          participant.toString() ===
          req.user._id.toString()
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view these messages",
      });
    }

    const totalMessages =
      await Message.countDocuments({
        conversation: conversationId,
      });

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "name email")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalMessages,
      totalPages: Math.ceil(
        totalMessages / limit
      ),
      count: messages.length,
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
 * MARK CONVERSATION AS READ
 */
export const markConversationAsRead =
  async (req, res) => {
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
        message:
          "Conversation marked as read",
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
export const getUnreadCount =
  async (req, res) => {
    try {

      const conversations =
        await Conversation.find({
          participants: req.user._id,
        });

      let unreadCount = 0;

      for (const conversation of conversations) {
        const count =
          await Message.countDocuments({
            conversation: conversation._id,
            readBy: {
              $ne: req.user._id,
            },
            sender: {
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