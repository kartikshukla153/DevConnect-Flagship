import Conversation from "../models/Conversation.js";

/**
 * CREATE OR GET CONVERSATION
 */
export const createOrGetConversation = async (req, res) => {
  try {
    const currentUser = req.user._id;
    const otherUser = req.params.userId;

    if (currentUser.toString() === otherUser) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a conversation with yourself",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [currentUser, otherUser],
      },
    }).populate("participants", "name email");

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
      });
    }

    conversation = await Conversation.create({
      participants: [currentUser, otherUser],
    });

    conversation = await Conversation.findById(conversation._id).populate(
      "participants",
      "name email"
    );

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * GET MY CONVERSATIONS
 */
export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name email")
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * GET SINGLE CONVERSATION
 */
export const getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.conversationId
    ).populate("participants", "name email");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant = conversation.participants.some(
      (participant) =>
        participant._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};