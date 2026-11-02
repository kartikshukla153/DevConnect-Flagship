import mongoose from "mongoose";
import Project from "../../models/project.js";
import Task from "../../models/Task.js";

export const getWorkspace = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!mongoose.isValidObjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    // Scope the lookup to the authenticated creator or a project member.
    // This prevents users from reading another project's workspace by ID.
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { creator: userId },
        { members: { $elemMatch: { user: userId } } },
      ],
    })
      .populate("creator", "name username profilePicture")
      .populate("members.user", "name username profilePicture")
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied.",
      });
    }

    const tasks = await Task.find({ project: projectId })
      .sort({ createdAt: 1, _id: 1 })
      .lean();

    const milestonesMap = new Map();

    for (const task of tasks) {
      const milestoneTitle = task.labels?.[0]?.trim() || "General";
      if (!milestonesMap.has(milestoneTitle)) {
        milestonesMap.set(milestoneTitle, []);
      }
      milestonesMap.get(milestoneTitle).push(task);
    }

    const milestones = Array.from(milestonesMap, ([title, milestoneTasks]) => ({
      title,
      tasks: milestoneTasks,
    }));

    const completed = tasks.filter((task) => task.status === "completed").length;
    const inProgress = tasks.filter((task) => task.status === "in-progress").length;
    const review = tasks.filter((task) => task.status === "review").length;

    return res.status(200).json({
      success: true,
      project,
      techStack: Array.isArray(project.techStack) ? project.techStack : [],
      milestones,
      stats: {
        totalTasks: tasks.length,
        completed,
        inProgress,
        review,
        todo: tasks.length - completed - inProgress - review,
        progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      },
    });
  } catch (error) {
    console.error("GET AI WORKSPACE ERROR:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to load this workspace right now.",
    });
  }
};
