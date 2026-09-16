import mongoose from "mongoose";

import Task from "../models/Task.js";
import Project from "../models/project.js";
import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";

import {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
} from "../socket/projectEvents.js";

/*
===========================================================
TASK CONTROLLER
===========================================================

Security principles:

1. Never trust project/task/user IDs from the client.
2. Every task mutation resolves the task's project first.
3. Project membership is checked server-side.
4. Role checks are performed server-side.
5. Invalid input receives a 4xx response.
6. Internal database errors are not exposed to clients.
7. Realtime events are emitted only after persistence.
8. Existing product permissions are preserved.
===========================================================
*/

const ALLOWED_PRIORITIES = [
  "low",
  "medium",
  "high",
];

const ALLOWED_STATUSES = [
  "todo",
  "in-progress",
  "review",
  "completed",
];

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_NOTES_LENGTH = 5000;
const MAX_REVIEW_COMMENT_LENGTH = 5000;

const isValidObjectId = (value) => {
  return mongoose.isValidObjectId(value);
};

const normalizeString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const getSafeErrorMessage = (error, fallback) => {
  if (
    error?.name === "ValidationError" ||
    error?.name === "CastError"
  ) {
    return "Invalid request data";
  }

  return fallback;
};

const getProjectMember = (project, userId) => {
  if (!project || !userId) {
    return null;
  }

  return (
    project.members.find(
      (member) =>
        member.user?.toString() ===
        userId.toString()
    ) || null
  );
};

const requireAuthenticatedUser = (req, res) => {
  if (!req.user?._id) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return false;
  }

  return true;
};

const getTaskAndProject = async (taskId) => {
  if (!isValidObjectId(taskId)) {
    const error = new Error("INVALID_TASK_ID");
    error.code = "INVALID_TASK_ID";
    throw error;
  }

  const task = await Task.findById(taskId);

  if (!task) {
    const error = new Error("TASK_NOT_FOUND");
    error.code = "TASK_NOT_FOUND";
    throw error;
  }

  const project = await Project.findById(task.project);

  if (!project) {
    const error = new Error("PROJECT_NOT_FOUND");
    error.code = "PROJECT_NOT_FOUND";
    throw error;
  }

  return {
    task,
    project,
  };
};

const populateTask = async (taskId) => {
  return Task.findById(taskId)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");
};

const emitActivity = async ({
  projectId,
  userId,
  type,
  message,
}) => {
  const activity = await Activity.create({
    project: projectId,
    user: userId,
    type,
    message,
  });

  return activity;
};

/**
 * =========================================================
 * CREATE TASK
 * =========================================================
 */
export const createTask = async (req, res) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const {
      title,
      description,
      projectId,
      assignedTo,
      priority,
      deadline,
    } = req.body || {};

    const normalizedTitle = normalizeString(title);
    const normalizedDescription =
      typeof description === "string"
        ? description.trim()
        : "";

    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "A valid project ID is required",
      });
    }

    if (!normalizedTitle) {
      return res.status(400).json({
        success: false,
        message: "Task title is required",
      });
    }

    if (normalizedTitle.length > MAX_TITLE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Task title cannot exceed ${MAX_TITLE_LENGTH} characters`,
      });
    }

    if (
      normalizedDescription.length >
      MAX_DESCRIPTION_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Task description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
      });
    }

    if (
      priority !== undefined &&
      priority !== null &&
      !ALLOWED_PRIORITIES.includes(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    if (
      deadline !== undefined &&
      deadline !== null &&
      deadline !== ""
    ) {
      const deadlineDate = new Date(deadline);

      if (Number.isNaN(deadlineDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid task deadline",
        });
      }
    }

    if (
      assignedTo &&
      !isValidObjectId(assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned user ID",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const member = getProjectMember(
      project,
      req.user._id
    );

    if (
      !member ||
      !["owner", "admin"].includes(member.role)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only owner or admin can create tasks",
      });
    }

    if (assignedTo) {
      const assignedMember = getProjectMember(
        project,
        assignedTo
      );

      if (!assignedMember) {
        return res.status(400).json({
          success: false,
          message:
            "Assigned user must be a project member",
        });
      }
    }

    const task = await Task.create({
      title: normalizedTitle,
      description: normalizedDescription,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      priority: priority || "medium",
      deadline:
        deadline === "" || deadline === undefined
          ? null
          : deadline,
    });

    const populatedTask = await populateTask(
      task._id
    );

    await emitActivity({
      projectId: task.project,
      userId: req.user._id,
      type: "task_created",
      message: `${req.user.name} created "${task.title}"`,
    });

    emitTaskCreated(
      projectId.toString(),
      populatedTask
    );

    return res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    if (error?.code === "INVALID_TASK_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: getSafeErrorMessage(
        error,
        "Unable to create task"
      ),
    });
  }
};

/**
 * =========================================================
 * GET PROJECT TASKS
 * =========================================================
 *
 * IMPORTANT:
 * This endpoint now requires project membership.
 * A user cannot read the task board of a project they
 * do not belong to simply by knowing the project ID.
 * =========================================================
 */
export const getProjectTasks = async (
  req,
  res
) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const { projectId } = req.params;

    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project =
      await Project.findById(projectId).select(
        "members"
      );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const member = getProjectMember(
      project,
      req.user._id
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message:
          "You are not a member of this project",
      });
    }

    const tasks = await Task.find({
      project: projectId,
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(
      "GET PROJECT TASKS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load project tasks",
    });
  }
};

/**
 * =========================================================
 * ASSIGN TASK
 * =========================================================
 */
export const assignTask = async (
  req,
  res
) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const { taskId } = req.params;
    const { assignedTo } = req.body || {};

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (
      !assignedTo ||
      !isValidObjectId(assignedTo)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid assigned user ID is required",
      });
    }

    const { task, project } =
      await getTaskAndProject(taskId);

    const currentMember = getProjectMember(
      project,
      req.user._id
    );

    if (
      !currentMember ||
      !["owner", "admin"].includes(
        currentMember.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only owner or admin can assign tasks",
      });
    }

    const assignedMember = getProjectMember(
      project,
      assignedTo
    );

    if (!assignedMember) {
      return res.status(400).json({
        success: false,
        message:
          "Assigned user must be a project member",
      });
    }

    task.assignedTo = assignedTo;

    await task.save();

    await emitActivity({
      projectId: task.project,
      userId: req.user._id,
      type: "task_assigned",
      message: `${req.user.name} assigned "${task.title}"`,
    });

    const updatedTask = await populateTask(
      task._id
    );

    emitTaskUpdated(
      task.project.toString(),
      updatedTask
    );

    return res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("ASSIGN TASK ERROR:", error);

    if (error?.code === "INVALID_TASK_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (error?.code === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (error?.code === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to assign task",
    });
  }
};

/**
 * =========================================================
 * UPDATE TASK
 * =========================================================
 *
 * Updates core editable task information.
 * =========================================================
 */
export const updateTask = async (
  req,
  res
) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const { taskId } = req.params;

    const {
      title,
      description,
      priority,
      deadline,
    } = req.body || {};

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const { task, project } =
      await getTaskAndProject(taskId);

    const member = getProjectMember(
      project,
      req.user._id
    );

    if (
      !member ||
      !["owner", "admin"].includes(
        member.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only owner or admin can update task details",
      });
    }

    if (title !== undefined) {
      const normalizedTitle =
        normalizeString(title);

      if (!normalizedTitle) {
        return res.status(400).json({
          success: false,
          message: "Task title cannot be empty",
        });
      }

      if (
        normalizedTitle.length >
        MAX_TITLE_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message: `Task title cannot exceed ${MAX_TITLE_LENGTH} characters`,
        });
      }

      task.title = normalizedTitle;
    }

    if (description !== undefined) {
      if (
        typeof description !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Task description must be a string",
        });
      }

      const normalizedDescription =
        description.trim();

      if (
        normalizedDescription.length >
        MAX_DESCRIPTION_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message: `Task description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`,
        });
      }

      task.description =
        normalizedDescription;
    }

    if (priority !== undefined) {
      if (
        !ALLOWED_PRIORITIES.includes(priority)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task priority",
        });
      }

      task.priority = priority;
    }

    if (
      deadline === null ||
      deadline === ""
    ) {
      task.deadline = null;
    } else if (deadline !== undefined) {
      const deadlineDate = new Date(
        deadline
      );

      if (
        Number.isNaN(
          deadlineDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task deadline",
        });
      }

      task.deadline = deadlineDate;
    }

    await task.save();

    const updatedTask = await populateTask(
      task._id
    );

    await emitActivity({
      projectId: task.project,
      userId: req.user._id,
      type: "task_updated",
      message: `${req.user.name} updated "${task.title}"`,
    });

    emitTaskUpdated(
      task.project.toString(),
      updatedTask
    );

    return res.status(200).json({
      success: true,
      message:
        "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "UPDATE TASK ERROR:",
      error
    );

    if (error?.code === "INVALID_TASK_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (error?.code === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (error?.code === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update task",
    });
  }
};

/**
 * =========================================================
 * UPDATE TASK STATUS
 * =========================================================
 */
export const updateTaskStatus = async (
  req,
  res
) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const { taskId } = req.params;
    const { status } = req.body || {};

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const { task, project } =
      await getTaskAndProject(taskId);

    const member = getProjectMember(
      project,
      req.user._id
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message:
          "Only project members can update tasks",
      });
    }

    /*
     * Preserve the original completedAt timestamp
     * when a completed task is moved back and forth.
     *
     * When the task leaves completed, completedAt is
     * cleared because it is no longer currently complete.
     */
    task.status = status;

    if (status === "completed") {
      task.completedAt =
        task.completedAt || new Date();
    } else {
      task.completedAt = null;
    }

    await task.save();

    await emitActivity({
      projectId: task.project,
      userId: req.user._id,
      type: "task_status_updated",
      message: `${req.user.name} moved "${task.title}" to ${status}`,
    });

    const updatedTask = await populateTask(
      task._id
    );

    emitTaskUpdated(
      task.project.toString(),
      updatedTask
    );

    return res.status(200).json({
      success: true,
      message:
        "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "UPDATE TASK STATUS ERROR:",
      error
    );

    if (error?.code === "INVALID_TASK_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (error?.code === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (error?.code === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to update task status",
    });
  }
};

/**
 * =========================================================
 * DELETE TASK
 * =========================================================
 */
export const deleteTask = async (
  req,
  res
) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const { task, project } =
      await getTaskAndProject(taskId);

    const member = getProjectMember(
      project,
      req.user._id
    );

    if (
      !member ||
      !["owner", "admin"].includes(
        member.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only owner or admin can delete tasks",
      });
    }

    const projectId =
      task.project.toString();

    const taskTitle = task.title;

    await Task.findByIdAndDelete(taskId);

    await emitActivity({
      projectId,
      userId: req.user._id,
      type: "task_deleted",
      message: `${req.user.name} deleted "${taskTitle}"`,
    });

    emitTaskDeleted(
      projectId,
      taskId
    );

    return res.status(200).json({
      success: true,
      message:
        "Task deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE TASK ERROR:",
      error
    );

    if (error?.code === "INVALID_TASK_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (error?.code === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (error?.code === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to delete task",
    });
  }
};

/**
 * =========================================================
 * GET SINGLE TASK
 * =========================================================
 */
export const getSingleTask = async (
  req,
  res
) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task =
      await Task.findById(taskId)
        .populate(
          "assignedTo",
          "name email"
        )
        .populate(
          "createdBy",
          "name email"
        );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    const project =
      await Project.findById(task.project)
        .select("members");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const member = getProjectMember(
      project,
      req.user._id
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        message:
          "Only project members can view this task",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(
      "GET SINGLE TASK ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load task",
    });
  }
};

/**
 * =========================================================
 * SUBMIT TASK
 * =========================================================
 */
export const submitTask = async (
  req,
  res
) => {
  try {
    if (!requireAuthenticatedUser(req, res)) {
      return;
    }

    const { taskId } = req.params;

    const {
      githubPR,
      githubCommit,
      liveLink,
      notes,
    } = req.body || {};

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const { task, project } =
      await getTaskAndProject(taskId);

    const member = getProjectMember(
      project,
      req.user._id
    );

    /*
     * The developer must still be an active member
     * of the project.
     */
    if (!member) {
      return res.status(403).json({
        success: false,
        message:
          "You are no longer a member of this project",
      });
    }

    if (
      !task.assignedTo ||
      task.assignedTo.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the assigned developer can submit this task",
      });
    }

    const normalizedNotes =
      typeof notes === "string"
        ? notes.trim()
        : "";

    if (
      normalizedNotes.length >
      MAX_NOTES_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: `Submission notes cannot exceed ${MAX_NOTES_LENGTH} characters`,
      });
    }

    if (
      githubPR !== undefined &&
      githubPR !== null &&
      typeof githubPR !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "GitHub pull request must be a string",
      });
    }

    if (
      githubCommit !== undefined &&
      githubCommit !== null &&
      typeof githubCommit !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "GitHub commit must be a string",
      });
    }

    if (
      liveLink !== undefined &&
      liveLink !== null &&
      typeof liveLink !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Live link must be a string",
      });
    }

    task.submission.githubPR =
      normalizeString(githubPR);

    task.submission.githubCommit =
      normalizeString(githubCommit);

    task.submission.liveLink =
      normalizeString(liveLink);

    task.submission.notes =
      normalizedNotes;

    task.submission.submittedBy =
      req.user._id;

    task.submission.submittedAt =
      new Date();

    task.submission.status =
      "pending";

    task.status = "review";

    task.submission.history.push({
      action: "submitted",
      user: req.user._id,
      comment: normalizedNotes,
    });

    await task.save();

    await emitActivity({
      projectId: task.project,
      userId: req.user._id,
      type: "submission_uploaded",
      message: `${req.user.name} submitted "${task.title}"`,
    });

    /*
     * Notify owner/admin users.
     *
     * Notification failure should be logged separately
     * instead of silently hiding the task submission.
     */
    const ownersAndAdmins =
      project.members.filter(
        (projectMember) =>
          projectMember.role === "owner" ||
          projectMember.role === "admin"
      );

    try {
      for (const projectMember of ownersAndAdmins) {
        /*
         * Avoid notifying the submitter about their own
         * submission when they also happen to be owner/admin.
         */
        if (
          projectMember.user.toString() ===
          req.user._id.toString()
        ) {
          continue;
        }

        await Notification.create({
          recipient: projectMember.user,
          sender: req.user._id,
          type: "task_submission",
          message: `${req.user.name} submitted "${task.title}"`,
          relatedProject: project._id,
        });
      }
    } catch (notificationError) {
      console.error(
        "TASK SUBMISSION NOTIFICATION ERROR:",
        notificationError
      );
    }

    const updatedTask = await populateTask(
      task._id
    );

    emitTaskUpdated(
      project._id.toString(),
      updatedTask
    );

    return res.status(200).json({
      success: true,
      message:
        "Task submitted successfully",
      submission: updatedTask.submission,
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "SUBMIT TASK ERROR:",
      error
    );

    if (error?.code === "INVALID_TASK_ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    if (error?.code === "TASK_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (error?.code === "PROJECT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to submit task",
    });
  }
};

/**
 * =========================================================
 * REVIEW TASK SUBMISSION
 * =========================================================
 */
export const reviewTaskSubmission =
  async (req, res) => {
    try {
      if (!requireAuthenticatedUser(req, res)) {
        return;
      }

      const { taskId } = req.params;

      const {
        status,
        reviewComment,
      } = req.body || {};

      if (!isValidObjectId(taskId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID",
        });
      }

      if (
        !["approved", "rejected"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid review status",
        });
      }

      const { task, project } =
        await getTaskAndProject(taskId);

      const reviewer =
        getProjectMember(
          project,
          req.user._id
        );

      if (
        !reviewer ||
        !["owner", "admin"].includes(
          reviewer.role
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Only owner/admin can review submissions",
        });
      }

      const normalizedReviewComment =
        typeof reviewComment === "string"
          ? reviewComment.trim()
          : "";

      if (
        normalizedReviewComment.length >
        MAX_REVIEW_COMMENT_LENGTH
      ) {
        return res.status(400).json({
          success: false,
          message: `Review comment cannot exceed ${MAX_REVIEW_COMMENT_LENGTH} characters`,
        });
      }

      /*
       * Only a submitted/pending task should be reviewed.
       *
       * This prevents an arbitrary review operation from
       * mutating a task that has no active submission.
       */
      if (
        !task.submission ||
        task.submission.status !==
          "pending"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This task has no pending submission to review",
        });
      }

      task.submission.status =
        status;

      task.submission.reviewComment =
        normalizedReviewComment;

      task.submission.reviewedBy =
        req.user._id;

      task.submission.reviewedAt =
        new Date();

      if (status === "approved") {
        task.status = "completed";
        task.completedAt =
          new Date();
      } else {
        task.status = "in-progress";
        task.completedAt = null;
      }

      task.submission.history.push({
        action: status,
        user: req.user._id,
        comment:
          normalizedReviewComment,
      });

      await task.save();

      await emitActivity({
        projectId: task.project,
        userId: req.user._id,
        type:
          status === "approved"
            ? "task_submission_approved"
            : "task_submission_rejected",
        message:
          status === "approved"
            ? `${req.user.name} approved "${task.title}"`
            : `${req.user.name} requested changes on "${task.title}"`,
      });

      /*
       * Notify the assigned developer.
       */
      if (task.assignedTo) {
        try {
          /*
           * Avoid sending a notification to the reviewer
           * if they are also the assigned developer.
           */
          if (
            task.assignedTo.toString() !==
            req.user._id.toString()
          ) {
            await Notification.create({
              recipient:
                task.assignedTo,
              sender: req.user._id,
              type:
                status === "approved"
                  ? "task_submission_approved"
                  : "task_submission_rejected",
              message:
                status === "approved"
                  ? `Your submission for "${task.title}" was approved`
                  : `Your submission for "${task.title}" was rejected`,
              relatedProject:
                project._id,
            });
          }
        } catch (notificationError) {
          console.error(
            "TASK REVIEW NOTIFICATION ERROR:",
            notificationError
          );
        }
      }

      const updatedTask =
        await populateTask(task._id);

      emitTaskUpdated(
        project._id.toString(),
        updatedTask
      );

      return res.status(200).json({
        success: true,
        message: `Submission ${status}`,
        task: updatedTask,
      });
    } catch (error) {
      console.error(
        "REVIEW TASK SUBMISSION ERROR:",
        error
      );

      if (
        error?.code ===
        "INVALID_TASK_ID"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid task ID",
        });
      }

      if (
        error?.code ===
        "TASK_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (
        error?.code ===
        "PROJECT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to review task submission",
      });
    }
  };