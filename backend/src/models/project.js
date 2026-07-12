import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    overview: {
      type: String,
      default: "",
    },

    techStack: [
      {
        type: String,
      },
    ],

    estimatedWeeks: {
      type: Number,
      default: 0,
    },

    difficulty: {
      type: String,
      default: "",
    },

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    rolesNeeded: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["open", "closed", "in-progress"],
      default: "open",
    },

    githubRepo: String,

    liveLink: String,

    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },

        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    pendingInvites: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        invitedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    joinRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Project", projectSchema);