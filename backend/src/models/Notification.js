import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
  "connection_request",
  "connection_accepted",

  "post_like",
  "post_comment",

  "message",

  "project_invite",
  "project_join_request",

  "project_role_updated",

  "task_submission",
  "task_submission_approved",
  "task_submission_rejected",

  "task_assigned",
  "task_completed",
],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    Read: {
      type: Boolean,
      default: false,
    },

    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;