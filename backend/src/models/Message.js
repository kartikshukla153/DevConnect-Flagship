import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    emoji: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    edited: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reactions: [reactionSchema],
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

// Fast message loading inside a conversation
messageSchema.index({
  conversation: 1,
  createdAt: 1,
});

// Fast unread/deleted filtering
messageSchema.index({
  conversation: 1,
  deleted: 1,
  createdAt: 1,
});

// Fast sender lookup
messageSchema.index({
  sender: 1,
  createdAt: -1,
});

export default mongoose.model(
  "Message",
  messageSchema
);