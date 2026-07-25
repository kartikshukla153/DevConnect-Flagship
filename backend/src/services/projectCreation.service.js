import Project from "../models/project.js";
import Task from "../models/Task.js";

export const createProjectFromRoadmap = async ({
  roadmap,
  creatorId,
  title,
}) => {
  // Create Project
  // -------------------------
// Extract GitHub URL
// -------------------------

const githubMatch =
  title.match(/https?:\/\/github\.com\/[^\s]+/i);

const githubUrl = githubMatch
  ? githubMatch[0]
  : "";

let owner = "";
let repo = "";

if (githubUrl) {
  const parts = githubUrl.replace(
    "https://github.com/",
    ""
  ).split("/");

  owner = parts[0] || "";
  repo = parts[1] || "";
}

const project = await Project.create({
  creator: creatorId,

  title,

  description: roadmap.overview,

  overview: roadmap.overview,

  techStack: roadmap.techStack || [],

  estimatedWeeks: roadmap.estimatedWeeks || 0,

  difficulty: roadmap.difficulty || "Intermediate",

  aiGenerated: true,

  githubRepo: githubUrl,

  githubRepository: {
    url: githubUrl,
    owner,
    repo,
    branch: "main",
    connectedAt: githubUrl
      ? new Date()
      : null,
  },

  members: [
    {
      user: creatorId,
      role: "owner",
    },
  ],
});

  const createdTasks = [];

  // Create Tasks
  for (const milestone of roadmap.milestones) {
    for (const task of milestone.tasks) {
      const createdTask = await Task.create({
        title: task,

        description: milestone.title,

        project: project._id,

        createdBy: creatorId,

        priority: "medium",

        difficulty: "Medium",

        estimatedHours: 2,

        storyPoints: 2,

        labels: [milestone.title],

        acceptanceCriteria: [
          `Complete: ${task}`,
        ],

        aiGenerated: true,
      });

      createdTasks.push(createdTask);
    }
  }

  return {
    project,
    tasks: createdTasks,
  };
};