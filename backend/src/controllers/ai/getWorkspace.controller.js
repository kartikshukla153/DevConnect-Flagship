import Project from "../../models/project.js";
import Task from "../../models/Task.js";

export const getWorkspace = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate("creator", "name username profilePicture")
      .populate("members.user", "name username profilePicture");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const tasks = await Task.find({
      project: projectId,
    }).sort({ createdAt: 1 });

    const completed = tasks.filter(
      (t) => t.status === "completed"
    ).length;

    const milestonesMap = {};

    tasks.forEach((task) => {
      const milestone =
        task.labels?.[0] || "General";

      if (!milestonesMap[milestone]) {
        milestonesMap[milestone] = [];
      }

      milestonesMap[milestone].push(task);
    });

    const milestones = Object.keys(milestonesMap).map(
      (title) => ({
        title,
        tasks: milestonesMap[title],
      })
    );

    return res.json({
      success: true,

      project,

      techStack: project.techStack,

      milestones,

      stats: {
        totalTasks: tasks.length,
        completed,
        progress:
          tasks.length === 0
            ? 0
            : Math.round(
                (completed / tasks.length) * 100
              ),
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};