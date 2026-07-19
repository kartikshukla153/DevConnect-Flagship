import { getIO } from "./socket.js";

/**
 * TASK CREATED
 */
export function emitTaskCreated(projectId, task) {
  const io = getIO();

  io.to(projectId).emit("task_created", task);

  io.to(projectId).emit("activity_added", {
    type: "task_created",
    message: `${task.createdBy?.name || "Someone"} created "${task.title}"`,
    createdAt: new Date(),
  });
}

/**
 * TASK UPDATED
 */
export function emitTaskUpdated(projectId, task) {
  const io = getIO();

  io.to(projectId).emit("task_updated", task);

  io.to(projectId).emit("activity_added", {
    type: "task_updated",
    message: `${task.title} moved to ${task.status}`,
    createdAt: new Date(),
  });
}

/**
 * TASK DELETED
 */
export function emitTaskDeleted(projectId, taskId) {
  const io = getIO();

  io.to(projectId).emit("task_deleted", {
    taskId,
  });

  io.to(projectId).emit("activity_added", {
    type: "task_deleted",
    message: "Task deleted",
    createdAt: new Date(),
  });
}

/**
 * TASK COMMENT
 */
export function emitTaskComment(projectId, comment) {
  const io = getIO();

  io.to(projectId).emit(
    "task_comment_added",
    comment
  );

  io.to(projectId).emit("activity_added", {
    type: "task_comment",
    message: `${comment.author?.name || "Someone"} commented on a task`,
    createdAt: new Date(),
    comment,
  });
}

/**
 * PROJECT CHAT
 */
export function emitProjectChat(projectId, message) {
  getIO().to(projectId).emit(
    "project_chat",
    message
  );
}

/**
 * PROJECT ACTIVITY
 */
export function emitProjectActivity(
  projectId,
  activity
) {
  getIO().to(projectId).emit(
    "activity_added",
    activity
  );
}

/**
 * TEAM UPDATED
 */
export function emitTeamUpdated(projectId) {
  getIO().to(projectId).emit(
    "team_updated"
  );
}

/**
 * LIVE PRESENCE
 */
export function emitPresenceUpdate(
  projectId,
  users
) {
  getIO().to(projectId).emit(
    "team_presence_updated",
    users
  );
}