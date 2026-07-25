import axios from "axios";
import Project from "../models/Project.js";

export const connectRepository = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        message: "Repository URL is required",
      });
    }

    const match = url.match(
      /^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/
    );

    if (!match) {
      return res.status(400).json({
        message: "Invalid GitHub repository URL",
      });
    }

    const owner = match[1];
    const repo = match[2];

    const github = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`
    );

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    project.githubRepository = {
      url,
      owner,
      repo,
      branch: github.data.default_branch,
      connectedAt: new Date(),
    };

    await project.save();

    res.json({
      success: true,
      repository: project.githubRepository,
      github: {
        name: github.data.full_name,
        description: github.data.description,
        stars: github.data.stargazers_count,
        forks: github.data.forks_count,
        issues: github.data.open_issues_count,
        defaultBranch: github.data.default_branch,
      },
    });
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      message: "Unable to connect repository",
    });
  }
};

export const getRepository = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!project.githubRepository?.owner) {
      return res.json(null);
    }

    const github = await axios.get(
      `https://api.github.com/repos/${project.githubRepository.owner}/${project.githubRepository.repo}`
    );

    res.json({
      repository: project.githubRepository,
      github: {
        name: github.data.full_name,
        description: github.data.description,
        stars: github.data.stargazers_count,
        forks: github.data.forks_count,
        issues: github.data.open_issues_count,
        watchers: github.data.watchers_count,
        language: github.data.language,
        defaultBranch: github.data.default_branch,
        updatedAt: github.data.updated_at,
      },
    });
  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      message: "Unable to fetch repository",
    });
  }
};