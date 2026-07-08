import User from "../models/User.js";
import Post from "../models/Post.js";
import Project from "../models/project.js";


export const searchUsers = async (req, res) => {
  try {
    const { query, skill, location } = req.query;

    let filters = {};

    if (query) {
      filters.$or = [
        { name: { $regex: query, $options: "i" } },
        { bio: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    if (skill) {
      filters.skills = {
        $in: [new RegExp(skill, "i")],
      };
    }

    if (location) {
      filters.location = {
        $regex: location,
        $options: "i",
      };
    }

    const users = await User.find(filters)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// SEARCH POSTS
// ======================================

export const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;

    const posts = await Post.find({
      content: {
        $regex: query,
        $options: "i",
      },
    })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// SEARCH PROJECTS
// ======================================

export const searchProjects = async (req, res) => {
  try {
    const { query } = req.query;

    const projects = await Project.find({
      $or: [
        {
          title: {
            $regex: query,
            $options: "i",
          },
        },
        {
          description: {
            $regex: query,
            $options: "i",
          },
        },
        {
          techStack: {
            $in: [new RegExp(query, "i")],
          },
        },
      ],
    })
      .populate("creator", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// DISCOVER DEVELOPERS
// ======================================

export const discoverDevelopers = async (req, res) => {
  try {
    const developers = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: developers.length,
      developers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};