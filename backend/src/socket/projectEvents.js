import { getIO } from "./socket.js";

/**
 * ==========================================
 * TASK CREATED
 * ==========================================
 */
export function emitTaskCreated(projectId, task) {
  const io = getIO();

  console.log("========== TASK CREATED ==========");
  console.log("ROOM:", projectId);
  console.log("TITLE:", task.title);

  io.to(projectId).emit("task_created", task);

  io.to(projectId).emit("activity_added", {
    type: "task_created",
    message: `${task.createdBy?.name || "Someone"} created "${task.title}"`,
    createdAt: new Date(),
  });

  console.log("========== SENT ==========");
}

/**
 * ==========================================
 * TASK UPDATED
 * ==========================================
 */
export function emitTaskUpdated(projectId, task) {
  const io = getIO();

  console.log("========== TASK UPDATED ==========");
  console.log("ROOM:", projectId);
  console.log("TITLE:", task.title);
  console.log("STATUS:", task.status);

  io.to(projectId).emit("task_updated", task);

  io.to(projectId).emit("activity_added", {
    type: "task_updated",
    message: `${task.title} moved to ${task.status}`,
    createdAt: new Date(),
  });

  console.log("========== SENT ==========");
}

/**
 * ==========================================
 * TASK DELETED
 * ==========================================
 */
export function emitTaskDeleted(projectId, taskId) {
  const io = getIO();

  console.log("========== TASK DELETED ==========");
  console.log("ROOM:", projectId);
  console.log("TASK:", taskId);

  io.to(projectId).emit("task_deleted", {
    taskId,
  });

  io.to(projectId).emit("activity_added", {
    type: "task_deleted",
    message: "Task deleted",
    createdAt: new Date(),
  });

  console.log("========== SENT ==========");
}

/**
 * ==========================================
 * TASK COMMENT
 * ==========================================
 */
export function emitTaskComment(projectId, comment) {
  const io = getIO();

  console.log("========== TASK COMMENT ==========");
  console.log("ROOM:", projectId);

  io.to(projectId).emit("task_comment_added", comment);

  io.to(projectId).emit("activity_added", {
    type: "task_comment",
    message: `${comment.author?.name || "Someone"} commented on a task`,
    createdAt: new Date(),
    comment,
  });

  console.log("========== SENT ==========");
}

/**
 * ==========================================
 * PROJECT CHAT
 * ==========================================
 */
export function emitProjectChat(projectId, message) {
  const io = getIO();

  io.to(projectId).emit("project_chat", message);
}

/**
 * ==========================================
 * PROJECT ACTIVITY
 * ==========================================
 */
export function emitProjectActivity(projectId, activity) {
  const io = getIO();

  io.to(projectId).emit("activity_added", activity);
}

/**
 * ==========================================
 * TEAM UPDATED
 * ==========================================
 */
export function emitTeamUpdated(projectId) {
  const io = getIO();

  io.to(projectId).emit("team_updated");
}

/**
 * ==========================================
 * LIVE PRESENCE
 * ==========================================
 */
export function emitPresenceUpdate(projectId, users) {
  const io = getIO();

  io.to(projectId).emit("team_presence_updated", users);
}