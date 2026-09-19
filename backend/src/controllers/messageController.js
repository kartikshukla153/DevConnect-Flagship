import mongoose from "mongoose";

import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

import {
  getIO,
  getReceiverSocketId,
} from "../socket/socket.js";

/**
 * ==========================================
 * CONSTANTS
 * ==========================================
 */

const MAX_MESSAGE_TEXT_LENGTH = 5000;
const MAX_SEARCH_RESULTS = 100;
const MAX_REACTION_LENGTH = 32;

/**
 * ==========================================
 * HELPERS
 * ==========================================
 */

const isValidObjectId = (value) =>
  mongoose.isValidObjectId(value);

const sameId = (a, b) => {
  if (!a || !b) return false;

  return a.toString() === b.toString();
};

const escapeRegex = (value = "") => {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
};

const isParticipant = (conversation, userId) => {
  if (!conversation || !userId) return false;

  return conversation.participants.some((participant) =>
    sameId(participant, userId)
  );
};

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

const getAttachmentPreviewText = (attachment) => {
  if (!attachment?.url) return "";

  const mimeType = attachment.mimeType || "";

  if (mimeType.startsWith("audio/")) {
    return "🎤 Voice Message";
  }

  if (mimeType.startsWith("image/")) {
    return "🖼️ Image";
  }

  if (mimeType.startsWith("video/")) {
    return "🎥 Video";
  }

  return "📎 Attachment";
};

const getMessagePreviewText = (message) => {
  if (!message) return "";

  if (message.deleted) {
    return "This message was deleted";
  }

  if (message.text?.trim()) {
    return message.text.trim();
  }

  return getAttachmentPreviewText(
    message.attachment
  );
};

/**
 * ==========================================
 * SOCKET EMISSION
 * ==========================================
 *
 * Sends an event to all participants except the
 * user who performed the action.
 *
 * This is important for sendMessage because the
 * sender already receives the API response.
 *
 * Other devices/tabs belonging to the sender can
 * still receive the event through their own socket
 * if their socket id differs.
 */

const emitToParticipants = (
  conversation,
  senderId,
  event,
  payload,
  includeSender = false
) => {
  try {
    const io = getIO();

    if (!io || !conversation) return;

    conversation.participants.forEach((participant) => {
      const participantId =
        participant?._id?.toString?.() ||
        participant?.toString?.();

      if (!participantId) return;

      if (
        !includeSender &&
        sameId(participantId, senderId)
      ) {
        return;
      }

      const socketId =
        getReceiverSocketId(participantId);

      if (socketId) {
        io.to(socketId).emit(
          event,
          payload
        );
      }
    });
  } catch (error) {
    /**
     * Socket failures must never turn a successful
     * database mutation into a failed HTTP request.
     */
    console.error(
      "MESSAGE SOCKET EMISSION ERROR:",
      error
    );
  }
};

/**
 * ==========================================
 * FIND CONVERSATION + AUTHORIZE
 * ==========================================
 */

const getAuthorizedConversation = async (
  conversationId,
  userId
) => {
  if (!isValidObjectId(conversationId)) {
    return {
      error: {
        status: 400,
        message: "Invalid conversation ID",
      },
    };
  }

  const conversation =
    await Conversation.findById(
      conversationId
    );

  if (!conversation) {
    return {
      error: {
        status: 404,
        message: "Conversation not found",
      },
    };
  }

  if (!isParticipant(conversation, userId)) {
    return {
      error: {
        status: 403,
        message: "You are not a participant in this conversation",
      },
    };
  }

  return {
    conversation,
  };
};

/**
 * ==========================================
 * UPDATE CONVERSATION PREVIEW
 * ==========================================
 */

const updateConversationPreview = async (
  conversationId
) => {
  const latestMessage =
    await Message.findOne({
      conversation: conversationId,
    })
      .sort({
        createdAt: -1,
      })
      .select(
        "text attachment deleted sender createdAt"
      )
      .lean();

  const conversation =
    await Conversation.findById(
      conversationId
    );

  if (!conversation) return null;

  if (!latestMessage) {
    conversation.lastMessage = null;
    conversation.lastMessageText = "";
    conversation.lastMessageSender = null;
    conversation.lastMessageAt = null;
  } else {
    conversation.lastMessage =
      latestMessage._id;

    conversation.lastMessageText =
      getMessagePreviewText(
        latestMessage
      );

    conversation.lastMessageSender =
      latestMessage.sender;

    conversation.lastMessageAt =
      latestMessage.createdAt;
  }

  await conversation.save();

  return conversation;
};

/**
 * ==========================================
 * SEND MESSAGE
 * ==========================================
 */

export const sendMessage = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const senderId = req.user._id;
    const { conversationId } =
      req.params;

    const text =
      typeof req.body?.text === "string"
        ? req.body.text.trim()
        : "";

    const replyTo =
      typeof req.body?.replyTo === "string"
        ? req.body.replyTo
        : null;

    /**
     * ----------------------------------------
     * BASIC VALIDATION
     * ----------------------------------------
     */

    if (!isValidObjectId(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    if (text.length > MAX_MESSAGE_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_MESSAGE_TEXT_LENGTH} characters`,
      });
    }

    if (
      replyTo &&
      !isValidObjectId(replyTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reply message ID",
      });
    }

    /**
     * ----------------------------------------
     * AUTHORIZE CONVERSATION
     * ----------------------------------------
     */

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    if (
      !isParticipant(
        conversation,
        senderId
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this conversation",
      });
    }

    /**
     * ----------------------------------------
     * VALIDATE REPLY
     * ----------------------------------------
     *
     * A reply must point to a message belonging
     * to the same conversation.
     */

    if (replyTo) {
      const replyMessage =
        await Message.findById(
          replyTo
        ).select(
          "_id conversation deleted"
        );

      if (!replyMessage) {
        return res.status(404).json({
          success: false,
          message: "Reply message not found",
        });
      }

      if (
        !sameId(
          replyMessage.conversation,
          conversationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Reply message belongs to another conversation",
        });
      }
    }

    /**
     * ----------------------------------------
     * UPLOAD ATTACHMENT
     * ----------------------------------------
     */

    let attachment = {
      url: "",
      publicId: "",
      originalName: "",
      mimeType: "",
      size: 0,
    };

    if (req.file) {
      const uploaded =
        await uploadToCloudinary(
          req.file
        );

      if (!uploaded?.secure_url) {
        return res.status(500).json({
          success: false,
          message: "Attachment upload failed",
        });
      }

      attachment = {
        url: uploaded.secure_url,
        publicId:
          uploaded.public_id || "",
        originalName:
          req.file.originalname || "",
        mimeType:
          req.file.mimetype || "",
        size:
          Number(req.file.size) || 0,
      };
    }

    /**
     * ----------------------------------------
     * MESSAGE CONTENT VALIDATION
     * ----------------------------------------
     */

    if (
      !text &&
      !attachment.url
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message must contain text or attachment",
      });
    }

    /**
     * ----------------------------------------
     * ATOMIC MESSAGE + CONVERSATION UPDATE
     * ----------------------------------------
     */

    let message;

    await session.withTransaction(
      async () => {
        const createdMessage =
          await Message.create(
            [
              {
                conversation:
                  conversation._id,
                sender: senderId,
                text,
                attachment,
                replyTo:
                  replyTo || null,
                readBy: [senderId],
              },
            ],
            {
              session,
            }
          );

        message =
          createdMessage[0];

        const preview =
          getMessagePreviewText(
            message
          );

        await Conversation.updateOne(
          {
            _id: conversation._id,
          },
          {
            $set: {
              lastMessage:
                message._id,
              lastMessageText:
                preview,
              lastMessageSender:
                senderId,
              lastMessageAt:
                message.createdAt ||
                new Date(),
            },
          },
          {
            session,
          }
        );
      }
    );

    /**
     * ----------------------------------------
     * POPULATE
     * ----------------------------------------
     */

    const populatedMessage =
      await populateMessage(
        Message.findById(
          message._id
        )
      );

    if (!populatedMessage) {
      return res.status(500).json({
        success: false,
        message:
          "Message was created but could not be loaded",
      });
    }

    /**
     * ----------------------------------------
     * REAL-TIME EVENT
     * ----------------------------------------
     *
     * Do not send the event back to the same
     * socket that just received the HTTP response.
     */

    emitToParticipants(
      conversation,
      senderId,
      "newMessage",
      populatedMessage,
      false
    );

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error(
      "Send Message Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to send message",
    });
  } finally {
    await session.endSession();
  }
};

/**
 * ==========================================
 * GET MESSAGES
 * ==========================================
 */

export const getMessages = async (
  req,
  res
) => {
  try {
    const {
      conversationId,
    } = req.params;

    const result =
      await getAuthorizedConversation(
        conversationId,
        req.user._id
      );

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          success: false,
          message:
            result.error.message,
        });
    }

    const messages =
      await Message.find({
        conversation:
          conversationId,
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
    console.error(
      "Get Messages Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to load messages",
    });
  }
};

/**
 * ==========================================
 * EDIT MESSAGE
 * ==========================================
 */

export const editMessage = async (
  req,
  res
) => {
  try {
    const {
      messageId,
    } = req.params;

    const text =
      typeof req.body?.text === "string"
        ? req.body.text.trim()
        : "";

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot be empty",
      });
    }

    if (
      text.length >
      MAX_MESSAGE_TEXT_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Message cannot exceed ${MAX_MESSAGE_TEXT_LENGTH} characters`,
      });
    }

    const message =
      await Message.findById(
        messageId
      );

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

    if (message.deleted) {
      return res.status(400).json({
        success: false,
        message:
          "Deleted messages cannot be edited",
      });
    }

    const conversation =
      await Conversation.findById(
        message.conversation
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }

    if (
      !isParticipant(
        conversation,
        req.user._id
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    message.text = text;
    message.edited = true;

    await message.save();

    /**
     * If this is the latest message,
     * keep the conversation preview synchronized.
     */

    if (
      sameId(
        conversation.lastMessage,
        message._id
      )
    ) {
      conversation.lastMessageText =
        getMessagePreviewText(
          message
        );

      conversation.lastMessageAt =
        message.updatedAt ||
        new Date();

      await conversation.save();
    }

    const populatedMessage =
      await populateMessage(
        Message.findById(
          message._id
        )
      );

    emitToParticipants(
      conversation,
      req.user._id,
      "messageUpdated",
      populatedMessage,
      true
    );

    return res.status(200).json({
      success: true,
      message:
        "Message updated successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error(
      "Edit Message Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to edit message",
    });
  }
};

/**
 * ==========================================
 * DELETE MESSAGE
 * ==========================================
 */

export const deleteMessage = async (
  req,
  res
) => {
  try {
    const {
      messageId,
    } = req.params;

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const message =
      await Message.findById(
        messageId
      );

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

    if (message.deleted) {
      return res.status(400).json({
        success: false,
        message:
          "Message has already been deleted",
      });
    }

    const conversation =
      await Conversation.findById(
        message.conversation
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }

    if (
      !isParticipant(
        conversation,
        req.user._id
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    message.deleted = true;
    message.text =
      "This message was deleted";
    message.reactions = [];

    await message.save();

    /**
     * Keep the conversation preview correct
     * if the deleted message was the latest one.
     */

    if (
      sameId(
        conversation.lastMessage,
        message._id
      )
    ) {
      await updateConversationPreview(
        conversation._id
      );
    }

    const populatedMessage =
      await populateMessage(
        Message.findById(
          message._id
        )
      );

    emitToParticipants(
      conversation,
      req.user._id,
      "messageDeleted",
      populatedMessage,
      true
    );

    return res.status(200).json({
      success: true,
      message:
        "Message deleted successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error(
      "Delete Message Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete message",
    });
  }
};

/**
 * ==========================================
 * REACT TO MESSAGE
 * ==========================================
 */

export const reactToMessage = async (
  req,
  res
) => {
  try {
    const {
      messageId,
    } = req.params;

    const emoji =
      typeof req.body?.emoji === "string"
        ? req.body.emoji.trim()
        : "";

    if (!isValidObjectId(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    if (
      !emoji ||
      emoji.length >
        MAX_REACTION_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reaction",
      });
    }

    const message =
      await Message.findById(
        messageId
      );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const conversation =
      await Conversation.findById(
        message.conversation
      );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message:
          "Conversation not found",
      });
    }

    if (
      !isParticipant(
        conversation,
        req.user._id
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (message.deleted) {
      return res.status(400).json({
        success: false,
        message:
          "Deleted messages cannot receive reactions",
      });
    }

    const existingReaction =
      message.reactions.find(
        (reaction) =>
          sameId(
            reaction.user,
            req.user._id
          )
      );

    if (existingReaction) {
      if (
        existingReaction.emoji ===
        emoji
      ) {
        message.reactions =
          message.reactions.filter(
            (reaction) =>
              !sameId(
                reaction.user,
                req.user._id
              )
          );
      } else {
        existingReaction.emoji =
          emoji;
      }
    } else {
      message.reactions.push({
        user: req.user._id,
        emoji,
      });
    }

    await message.save();

    const populatedMessage =
      await populateMessage(
        Message.findById(
          message._id
        )
      );

    emitToParticipants(
      conversation,
      req.user._id,
      "messageReactionUpdated",
      populatedMessage,
      true
    );

    return res.status(200).json({
      success: true,
      message:
        "Reaction updated successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error(
      "React To Message Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update reaction",
    });
  }
};

/**
 * ==========================================
 * MARK CONVERSATION AS READ
 * ==========================================
 */

export const markConversationAsRead =
  async (req, res) => {
    try {
      const {
        conversationId,
      } = req.params;

      const result =
        await getAuthorizedConversation(
          conversationId,
          req.user._id
        );

      if (result.error) {
        return res
          .status(result.error.status)
          .json({
            success: false,
            message:
              result.error.message,
          });
      }

      const updateResult =
        await Message.updateMany(
          {
            conversation:
              conversationId,
            sender: {
              $ne: req.user._id,
            },
            readBy: {
              $ne: req.user._id,
            },
          },
          {
            $addToSet: {
              readBy:
                req.user._id,
            },
          }
        );

      const conversation =
        result.conversation;

      emitToParticipants(
        conversation,
        req.user._id,
        "messagesSeen",
        {
          conversationId,
          userId:
            req.user._id.toString(),
        },
        true
      );

      return res.status(200).json({
        success: true,
        message:
          "Conversation marked as read",
        markedRead:
          updateResult.modifiedCount ||
          0,
      });
    } catch (error) {
      console.error(
        "Mark Conversation Read Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to mark conversation as read",
      });
    }
  };

/**
 * ==========================================
 * GET UNREAD COUNT
 * ==========================================
 */

export const getUnreadCount = async (
  req,
  res
) => {
  try {
    const result =
      await Message.aggregate([
        {
          $match: {
            sender: {
              $ne: req.user._id,
            },
            readBy: {
              $ne: req.user._id,
            },
          },
        },
        {
          $lookup: {
            from: "conversations",
            localField:
              "conversation",
            foreignField: "_id",
            as: "conversation",
          },
        },
        {
          $unwind:
            "$conversation",
        },
        {
          $match: {
            "conversation.participants":
              req.user._id,
          },
        },
        {
          $count:
            "unreadCount",
        },
      ]);

    const unreadCount =
      result[0]?.unreadCount || 0;

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get Unread Count Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to get unread count",
    });
  }
};

/**
 * ==========================================
 * SEARCH MESSAGES
 * ==========================================
 */

export const searchMessages = async (
  req,
  res
) => {
  try {
    const {
      conversationId,
    } = req.params;

    const q =
      typeof req.query?.q === "string"
        ? req.query.q.trim()
        : "";

    if (!q) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    const result =
      await getAuthorizedConversation(
        conversationId,
        req.user._id
      );

    if (result.error) {
      return res
        .status(result.error.status)
        .json({
          success: false,
          message:
            result.error.message,
        });
    }

    const safeQuery =
      escapeRegex(q);

    const messages =
      await Message.find({
        conversation:
          conversationId,
        deleted: false,
        text: {
          $regex: safeQuery,
          $options: "i",
        },
      })
        .populate(
          "sender",
          "name profilePicture"
        )
        .populate({
          path: "replyTo",
          populate: {
            path: "sender",
            select: "name",
          },
        })
        .sort({
          createdAt: -1,
        })
        .limit(
          MAX_SEARCH_RESULTS
        );

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(
      "Search Messages Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to search messages",
    });
  }
};