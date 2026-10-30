
import mongoose from "mongoose";
import Project from "../models/project.js";
import Task from "../models/Task.js";

export const createProjectFromRoadmap = async ({
  roadmap,
  creatorId,
  title,
}) => {
  if (!mongoose.isValidObjectId(creatorId)) {
    throw new Error("A valid project creator is required.");
  }

  if (
    typeof title !== "string" ||
    !title.trim() ||
    !roadmap ||
    !Array.isArray(roadmap.milestones)
  ) {
    throw new Error("Invalid project creation data.");
  }

  // A project idea is not proof that a GitHub repository exists
  // or that the user has authorized a repository connection.
  const project = await Project.create({
    creator: creatorId,
    title: title.trim().slice(0, 120),
    description: roadmap.overview,
    overview: roadmap.overview,
    techStack: roadmap.techStack,
    estimatedWeeks: roadmap.estimatedWeeks,
    difficulty: roadmap.difficulty,
    aiGenerated: true,
    githubRepo: "",
    githubRepository: {
      url: "",
      owner: "",
      repo: "",
      branch: "main",
      connectedAt: null,
    },
    members: [
      {
        user: creatorId,
        role: "owner",
      },
    ],
  });

  const taskDocuments = roadmap.milestones.flatMap((milestone) =>
    milestone.tasks.map((taskTitle) => ({
      title: taskTitle,
      description: `Milestone: ${milestone.title}`,
      project: project._id,
      createdBy: creatorId,
      priority: "medium",
      difficulty: "Medium",
      estimatedHours: 2,
      storyPoints: 2,
      labels: [milestone.title],
      acceptanceCriteria: [`Complete: ${taskTitle}`],
      aiGenerated: true,
    }))
  );

  try {
    const createdTasks = await Task.insertMany(taskDocuments, {
      ordered: true,
    });

    return {
      project,
      tasks: createdTasks,
    };
  } catch (error) {
    // Compensating cleanup: avoid leaving a project with no or only
    // partially inserted roadmap tasks if task creation fails.
    try {
      await Task.deleteMany({ project: project._id });
      await Project.deleteOne({ _id: project._id });
    } catch (cleanupError) {
      console.error("AI project cleanup failed:", {
        projectId: String(project._id),
        message: cleanupError.message,
      });
    }

    throw error;
  }
};
