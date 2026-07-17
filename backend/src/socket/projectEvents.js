import { getIO } from "./socket.js";

export function emitTaskCreated(projectId, task) {
  getIO().to(projectId).emit("task_created", task);

  getIO().to(projectId).emit("activity_added", {
    type: "task_created",
    message: `${task.createdBy?.name || "Someone"} created "${task.title}"`,
    createdAt: new Date(),
  });
}

export function emitTaskUpdated(projectId, task) {
  getIO().to(projectId).emit("task_updated", task);

  getIO().to(projectId).emit("activity_added", {
    type: "task_updated",
    message: `${task.title} moved to ${task.status}`,
    createdAt: new Date(),
  });
}

export function emitTaskDeleted(projectId, taskId) {
  getIO().to(projectId).emit("task_deleted", {
    taskId,
  });

  getIO().to(projectId).emit("activity_added", {
    type: "task_deleted",
    message: "A task was deleted",
    createdAt: new Date(),
  });
}

export function emitProjectActivity(projectId, activity) {
  getIO().to(projectId).emit(
    "activity_added",
    activity
  );
}

export function emitProjectChat(projectId, message) {
  getIO().to(projectId).emit(
    "project_chat",
    message
  );
}