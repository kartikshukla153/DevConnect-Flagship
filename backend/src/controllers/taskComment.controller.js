import TaskComment from "../models/TaskComment.js";
import Task from "../models/Task.js";
import Project from "../models/project.js";

import {
  emitTaskComment,
} from "../socket/projectEvents.js";

export const getComments = async (
  req,
  res
) => {
  try {
    const task =
      await Task.findById(
        req.params.taskId
      );

    if (!task)
      return res.status(404).json({
        message: "Task not found",
      });

    const comments =
      await TaskComment.find({
        task: task._id,
      })
        .populate(
          "author",
          "name email profilePicture"
        )
        .sort({
          createdAt: 1,
        });

    res.json({
      success: true,
      comments,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const createComment =
  async (req, res) => {
    try {
      const { content } = req.body;

      const task =
        await Task.findById(
          req.params.taskId
        );

      if (!task)
        return res
          .status(404)
          .json({
            message:
              "Task not found",
          });

      const project =
        await Project.findById(
          task.project
        );

      const member =
        project.members.find(
          (m) =>
            m.user.toString() ===
            req.user._id.toString()
        );

      if (!member)
        return res
          .status(403)
          .json({
            message:
              "Not project member",
          });

      const comment =
        await TaskComment.create({
          task: task._id,
          project:
            task.project,
          author: req.user._id,
          content,
        });

      const populated =
        await TaskComment.findById(
          comment._id
        ).populate(
          "author",
          "name email profilePicture"
        );

      emitTaskComment(
        task.project.toString(),
        populated
      );

      res.status(201).json({
        success: true,
        comment: populated,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };

export const updateComment =
  async (req, res) => {
    try {
      const comment =
        await TaskComment.findById(
          req.params.commentId
        );

      if (!comment)
        return res
          .status(404)
          .json({
            message:
              "Comment not found",
          });

      if (
        comment.author.toString() !==
        req.user._id.toString()
      )
        return res
          .status(403)
          .json({
            message:
              "Unauthorized",
          });

      comment.content =
        req.body.content;

      comment.edited = true;

      comment.editedAt =
        new Date();

      await comment.save();

      res.json({
        success: true,
        comment,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };

export const deleteComment =
  async (req, res) => {
    try {
      const comment =
        await TaskComment.findById(
          req.params.commentId
        );

      if (!comment)
        return res
          .status(404)
          .json({
            message:
              "Comment not found",
          });

      if (
        comment.author.toString() !==
        req.user._id.toString()
      )
        return res
          .status(403)
          .json({
            message:
              "Unauthorized",
          });

      await comment.deleteOne();

      res.json({
        success: true,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  };