import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "todo",
        "in-progress",
        "review",
        "completed",
      ],
      default: "todo",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    estimatedHours: {
      type: Number,
      default: 2,
    },

    storyPoints: {
      type: Number,
      default: 1,
    },

    acceptanceCriteria: [
      {
        type: String,
      },
    ],

    labels: [
      {
        type: String,
      },
    ],

    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    aiGenerated: {
      type: Boolean,
      default: false,
    },

    /* ===========================
       TASK SUBMISSION
    =========================== */

    submission: {
      githubPR: {
        type: String,
        default: "",
      },

      githubCommit: {
        type: String,
        default: "",
      },

      liveLink: {
        type: String,
        default: "",
      },

      notes: {
        type: String,
        default: "",
      },

      attachments: [
        {
          fileName: {
            type: String,
            default: "",
          },

          fileUrl: {
            type: String,
            default: "",
          },

          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          "not_submitted",
          "pending",
          "approved",
          "rejected",
        ],
        default: "not_submitted",
      },

      reviewComment: {
        type: String,
        default: "",
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      history: [
        {
          action: {
            type: String,
            default: "",
          },

          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },

          comment: {
            type: String,
            default: "",
          },

          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],

      aiReview: {
        score: {
          type: Number,
          default: 0,
        },

        summary: {
          type: String,
          default: "",
        },

        suggestions: [
          {
            type: String,
          },
        ],

        reviewedAt: {
          type: Date,
          default: null,
        },
      },
    },

    completedAt: {
      type: Date,
      default: null,
    },

    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);