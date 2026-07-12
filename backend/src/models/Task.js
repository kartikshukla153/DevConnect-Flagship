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

    completedAt: {
      type: Date,
    },

    deadline: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Task", taskSchema);