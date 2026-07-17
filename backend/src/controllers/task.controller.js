import Task from "../models/Task.js";
import Project from "../models/project.js";
import Activity from "../models/Activity.js";
import {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
  emitProjectActivity,
} from "../socket/projectEvents.js";
/**
 * 
 * CREATE TASK
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      projectId,
      assignedTo,
      priority,
      deadline,
    } = req.body;
await Activity.create({
  project: projectId,
  user: req.user._id,
  type: "task_created",
  message: `${req.user.name} created task "${title}"`,
});
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const member = project.members.find(
      (member) =>
        member.user.toString() ===
        req.user._id.toString()
    );

    if (
      !member ||
      !["owner", "admin"].includes(member.role)
    ) {
      return res.status(403).json({
        message:
          "Only owner or admin can create tasks",
      });
    }

    if (assignedTo) {
      const assignedMember =
        project.members.find(
          (member) =>
            member.user.toString() ===
            assignedTo
        );

      if (!assignedMember) {
        return res.status(400).json({
          message:
            "Assigned user must be a project member",
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo,
      createdBy: req.user._id,
      priority,
      deadline,
    });

    const populatedTask =
      await Task.findById(task._id)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
emitTaskCreated(projectId, populatedTask);
    return res.status(201).json({
      success: true,
      task: populatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * GET PROJECT TASKS
 */
export const getProjectTasks = async (
  req,
  res
) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
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
    return res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * ASSIGN TASK
 */
export const assignTask = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;
    const { assignedTo } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(
      task.project
    );

    const currentMember =
      project.members.find(
        (member) =>
          member.user.toString() ===
          req.user._id.toString()
      );

    if (
      !currentMember ||
      !["owner", "admin"].includes(
        currentMember.role
      )
    ) {
      return res.status(403).json({
        message:
          "Only owner or admin can assign tasks",
      });
    }

    const assignedMember =
      project.members.find(
        (member) =>
          member.user.toString() ===
          assignedTo
      );

    if (!assignedMember) {
      return res.status(400).json({
        message:
          "Assigned user must be a project member",
      });
    }

    task.assignedTo = assignedTo;

    await task.save();
    await Activity.create({
  project: task.project,
  user: req.user._id,
  type: "task_assigned",
  message: `${req.user.name} assigned task`,
});

    const updatedTask =
      await Task.findById(task._id)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
/**
 * UPDATE TASK STATUS
 */
export const updateTaskStatus = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "todo",
      "in-progress",
      "review",
      "completed",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(
      task.project
    );

    const member = project.members.find(
      (member) =>
        member.user.toString() ===
        req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        message:
          "Only project members can update tasks",
      });
    }

    task.status = status;

    await task.save();
    
    await Activity.create({
  project: task.project,
  user: req.user._id,
  type: "task_status_updated",
  message: `${req.user.name} changed task "${task.title}" status to ${status}`,
});

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "assignedTo",
          "name email"
        )
        .populate(
          "createdBy",
          "name email"
        );
emitTaskUpdated(task.project.toString(), updatedTask);
    return res.status(200).json({
      success: true,
      message:
        "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}; 
/**
 * DELETE TASK
 */
export const deleteTask = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = await Project.findById(
      task.project
    );

    const member = project.members.find(
      (member) =>
        member.user.toString() ===
        req.user._id.toString()
    );

    if (
      !member ||
      !["owner", "admin"].includes(member.role)
    ) {
      return res.status(403).json({
        message:
          "Only owner or admin can delete tasks",
      });
    }

    await Task.findByIdAndDelete(taskId);
    emitTaskDeleted(
  task.project.toString(),
  taskId
);

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });

} 
};
/**
 * GET SINGLE TASK
 */
export const getSingleTask = async (
  req,
  res
) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findById(taskId)
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
        message: "Task not found",
      });
    }

    const project = await Project.findById(
      task.project
    );

    const member = project.members.find(
      (member) =>
        member.user.toString() ===
        req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({
        message:
          "Only project members can view this task",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};