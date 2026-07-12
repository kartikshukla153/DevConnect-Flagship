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

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },

    publicId: {
      type: String,
      default: "",
    },

    originalName: {
      type: String,
      default: "",
    },

    mimeType: {
      type: String,
      default: "",
    },

    size: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const voiceSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },

    duration: {
      type: Number,
      default: 0,
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
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      default: "",
      trim: true,
    },

    attachment: {
      type: attachmentSchema,
      default: () => ({}),
    },

    voice: {
      type: voiceSchema,
      default: () => ({}),
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
    },

    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    reactions: {
      type: [reactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Message",
  messageSchema
);