import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

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
    }).populate(
      "participants",
      "name email profilePicture isOnline lastSeen"
    );

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
      });
    }

    conversation = await Conversation.create({
      participants: [currentUser, otherUser],
    });

    conversation = await Conversation.findById(
      conversation._id
    ).populate(
      "participants",
      "name email profilePicture isOnline lastSeen"
    );

    return res.status(201).json({
      success: true,
      conversation,
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
 * GET MY CONVERSATIONS
 */
export const getMyConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate(
        "participants",
        "name email profilePicture isOnline lastSeen"
      )
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    ).populate(
      "participants",
      "name email profilePicture isOnline lastSeen"
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * SUGGESTED DEVELOPERS
 */
export const getSuggestedDevelopers = async (req, res) => {
  try {
    const myId = req.user._id;

    const conversations = await Conversation.find({
      participants: myId,
    });

    const connectedIds = [];

    conversations.forEach((conv) => {
      conv.participants.forEach((id) => {
        if (id.toString() !== myId.toString()) {
          connectedIds.push(id);
        }
      });
    });

    const developers = await User.find({
      _id: {
        $nin: [...connectedIds, myId],
      },
    }).select(
      "name email username profilePicture isOnline lastSeen"
    );

    return res.status(200).json({
      success: true,
      developers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};