import mongoose from "mongoose";

const taskCommentSchema =
  new mongoose.Schema(
    {
      task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true,
        index: true,
      },

      project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
      },

      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000,
      },

      edited: {
        type: Boolean,
        default: false,
      },

      editedAt: Date,

      mentions: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      reactions: [
        {
          emoji: String,

          users: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
          ],
        },
      ],

      attachments: [
        {
          fileName: String,
          fileUrl: String,
          fileSize: Number,
          mimeType: String,
        },
      ],
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "TaskComment",
  taskCommentSchema
);