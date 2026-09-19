import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const userFields =
  "name email profilePicture isOnline lastSeen";

export const createOrGetConversation = async (req, res) => {
  try {
    const currentUser = req.user._id;
    const otherUser = req.params.userId;

    if (currentUser.toString() === otherUser) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot start a conversation with yourself",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [currentUser, otherUser],
      },
    })
      .populate("participants", userFields)
      .populate("lastMessage");

    if (conversation) {
      const unreadCount =
        await Message.countDocuments({
          conversation: conversation._id,
          sender: {
            $ne: currentUser,
          },
          readBy: {
            $ne: currentUser,
          },
        });

      const conversationData =
        conversation.toObject();

      conversationData.unreadCount = unreadCount;

      return res.status(200).json({
        success: true,
        conversation: conversationData,
      });
    }

    conversation = await Conversation.create({
      participants: [currentUser, otherUser],
    });

    conversation = await Conversation.findById(
      conversation._id
    )
      .populate("participants", userFields)
      .populate("lastMessage");

    const conversationData =
      conversation.toObject();

    conversationData.unreadCount = 0;

    return res.status(201).json({
      success: true,
      conversation: conversationData,
    });
  } catch (error) {
    console.error(
      "CREATE OR GET CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyConversations = async (
  req,
  res
) => {
  try {
    const currentUserId = req.user._id;

    const conversations =
      await Conversation.find({
        participants: currentUserId,
      })
        .populate(
          "participants",
          userFields
        )
        .populate("lastMessage")
        .sort({
          lastMessageAt: -1,
          updatedAt: -1,
        });

    const conversationsWithUnread =
      await Promise.all(
        conversations.map(async (conversation) => {
          const unreadCount =
            await Message.countDocuments({
              conversation: conversation._id,
              sender: {
                $ne: currentUserId,
              },
              readBy: {
                $ne: currentUserId,
              },
            });

          const data =
            conversation.toObject();

          data.unreadCount = unreadCount;

          return data;
        })
      );

    return res.status(200).json({
      success: true,
      conversations:
        conversationsWithUnread,
    });
  } catch (error) {
    console.error(
      "GET MY CONVERSATIONS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getConversation = async (
  req,
  res
) => {
  try {
    const currentUserId = req.user._id;

    const conversation =
      await Conversation.findById(
        req.params.conversationId
      )
        .populate(
          "participants",
          userFields
        )
        .populate("lastMessage");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const isParticipant =
      conversation.participants.some(
        (user) =>
          String(user._id) ===
          String(currentUserId)
      );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a participant in this conversation",
      });
    }

    const unreadCount =
      await Message.countDocuments({
        conversation: conversation._id,
        sender: {
          $ne: currentUserId,
        },
        readBy: {
          $ne: currentUserId,
        },
      });

    const conversationData =
      conversation.toObject();

    conversationData.unreadCount =
      unreadCount;

    return res.status(200).json({
      success: true,
      conversation:
        conversationData,
    });
  } catch (error) {
    console.error(
      "GET CONVERSATION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSuggestedDevelopers =
  async (req, res) => {
    try {
      const myId = req.user._id;

      const conversations =
        await Conversation.find({
          participants: myId,
        });

      const connectedIds = [];

      conversations.forEach((conv) => {
        conv.participants.forEach((id) => {
          if (
            id.toString() !==
            myId.toString()
          ) {
            connectedIds.push(id);
          }
        });
      });

      const developers =
        await User.find({
          _id: {
            $nin: [
              ...connectedIds,
              myId,
            ],
          },
        }).select(
          "name email username profilePicture isOnline lastSeen"
        );

      return res.status(200).json({
        success: true,
        developers,
      });
    } catch (error) {
      console.error(
        "GET SUGGESTED DEVELOPERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };