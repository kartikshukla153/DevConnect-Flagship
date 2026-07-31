import axios from "axios";
import Project from "../models/Project.js";

const github = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
});

async function getProjectRepository(projectId) {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  if (
    !project.githubRepository ||
    !project.githubRepository.owner ||
    !project.githubRepository.repo
  ) {
    throw new Error("Repository not connected");
  }

  return {
    project,
    owner: project.githubRepository.owner,
    repo: project.githubRepository.repo,
  };
}

/*
==========================================
CONNECT REPOSITORY
==========================================
*/

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

    const response = await github.get(
      `/repos/${owner}/${repo}`
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
      branch: response.data.default_branch,
      connectedAt: new Date(),
    };

    await project.save();

    return res.json({
      success: true,
      repository: project.githubRepository,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    return res.status(500).json({
      message: "Unable to connect repository",
    });
  }
};

/*
==========================================
REPOSITORY OVERVIEW
==========================================
*/

export const getRepository = async (req, res) => {
  try {
    const { owner, repo } =
      await getProjectRepository(req.params.projectId);

    const response = await github.get(
      `/repos/${owner}/${repo}`
    );

    const repository = response.data;

    return res.json({
      success: true,
      repository: {
        id: repository.id,
        name: repository.name,
        fullName: repository.full_name,
        description: repository.description,

        owner: repository.owner.login,
        avatar: repository.owner.avatar_url,

        stars: repository.stargazers_count,
        forks: repository.forks_count,
        watchers: repository.watchers_count,
        openIssues: repository.open_issues_count,

        defaultBranch: repository.default_branch,

        language: repository.language,
        visibility: repository.visibility,

        size: repository.size,

        createdAt: repository.created_at,
        updatedAt: repository.updated_at,
        pushedAt: repository.pushed_at,

        htmlUrl: repository.html_url,
      },
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    return res.status(500).json({
      message: err.message,
    });
  }
};

/*
==========================================
RECENT COMMITS
==========================================
*/

export const getRepositoryCommits = async (req, res) => {
  try {
    const { owner, repo } =
      await getProjectRepository(req.params.projectId);

    const response = await github.get(
      `/repos/${owner}/${repo}/commits?per_page=10`
    );

    const commits = response.data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author:
        commit.commit.author?.name || "Unknown",

      avatar:
        commit.author?.avatar_url || null,

      profile:
        commit.author?.html_url || null,

      date:
        commit.commit.author?.date,

      url:
        commit.html_url,
    }));

    return res.json({
      success: true,
      commits,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    return res.status(500).json({
      message: "Unable to fetch commits.",
    });
  }
};
/*
==========================================
REPOSITORY CONTRIBUTORS
==========================================
*/

export const getRepositoryContributors = async (req, res) => {
  try {
    const { owner, repo } =
      await getProjectRepository(req.params.projectId);

    const response = await github.get(
      `/repos/${owner}/${repo}/contributors?per_page=30`
    );

    const contributors = response.data.map((user) => ({
      id: user.id,
      username: user.login,
      avatar: user.avatar_url,
      profile: user.html_url,
      contributions: user.contributions,
      type: user.type,
    }));

    return res.json({
      success: true,
      contributors,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    return res.status(500).json({
      message: "Unable to fetch contributors",
    });
  }
};
  /*
==========================================
REPOSITORY LANGUAGES
==========================================
*/

export const getRepositoryLanguages = async (req, res) => {
  try {
    const { owner, repo } =
      await getProjectRepository(req.params.projectId);

    const response = await github.get(
      `/repos/${owner}/${repo}/languages`
    );

    const languages = response.data;

    const total = Object.values(languages).reduce(
      (a, b) => a + b,
      0
    );

    const result = Object.entries(languages).map(
      ([language, bytes]) => ({
        language,
        bytes,
        percentage: Number(
          ((bytes / total) * 100).toFixed(1)
        ),
      })
    );

    res.json({
      success: true,
      languages: result,
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    res.status(500).json({
      message: "Unable to fetch repository languages",
    });
  }
};

/*
==========================================
REPOSITORY ANALYTICS
==========================================
*/

export const getRepositoryAnalytics = async (req, res) => {
  try {
    const { owner, repo } =
      await getProjectRepository(req.params.projectId);

    const [
      repository,
      contributors,
      commits,
      languages,
    ] = await Promise.all([
      github.get(`/repos/${owner}/${repo}`),
      github.get(`/repos/${owner}/${repo}/contributors?per_page=100`),
      github.get(`/repos/${owner}/${repo}/commits?per_page=100`),
      github.get(`/repos/${owner}/${repo}/languages`),
    ]);

    const repoData = repository.data;

    const totalCommits = commits.data.length;

    const totalContributors =
      contributors.data.length;

    const languageCount =
      Object.keys(languages.data).length;

    const score =
      Math.min(
        100,
        Math.round(
          repoData.stargazers_count / 500 +
          repoData.forks_count / 200 +
          totalContributors * 2 +
          languageCount * 4 +
          totalCommits / 5
        )
      );

    res.json({
      success: true,

      analytics: {
        healthScore: score,

        commits: totalCommits,

        contributors: totalContributors,

        stars: repoData.stargazers_count,

        forks: repoData.forks_count,

        watchers: repoData.watchers_count,

        openIssues: repoData.open_issues_count,

        languages: Object.keys(
          languages.data
        ).length,
      },
    });
  } catch (err) {
    console.log(err.response?.data || err.message);

    res.status(500).json({
      message: "Unable to fetch analytics",
    });
  }
};
