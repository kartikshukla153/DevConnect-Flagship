import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
  "project_created",

  "member_joined",
  "member_removed",
  "member_promoted",
  "member_demoted",

  "invite_sent",
  "invite_accepted",
  "invite_rejected",

  "join_request_sent",
  "join_request_approved",
  "join_request_rejected",

  "task_created",
  "task_assigned",
  "task_status_updated",
  "task_completed",

  "comment_added",
  "submission_uploaded",

  "ai_generated_tasks",
  "ai_review_completed",
  "file_uploaded",
  "file_deleted",
"github_connected",
"github_pr_linked",
"task_reviewed",
"task_reopened",
"task_submission_approved",
"task_submission_rejected",
],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Activity = mongoose.model(
  "Activity",
  activitySchema
);

export default Activity;