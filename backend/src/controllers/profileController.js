import mongoose from "mongoose";

import Profile from "../models/Profile.js";
import User from "../models/User.js";

/**
 * CREATE OR UPDATE PROFILE
 */
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      username,
      headline,
      bio,
      skills,
      location,
      github,
      linkedin,
      portfolio,
      twitter,
      availability,
    } = req.body;

    const profileData = {
      user: req.user._id,
      username: username?.trim() || "",
      headline: headline?.trim() || "",
      bio: bio?.trim() || "",
      skills: Array.isArray(skills) ? skills : [],
      location: location?.trim() || "",
      availability: availability || "",
      socialLinks: {
        github: github?.trim() || "",
        linkedin: linkedin?.trim() || "",
        portfolio: portfolio?.trim() || "",
        twitter: twitter?.trim() || "",
      },
    };

    let profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      profile = await Profile.create(profileData);

      return res.status(201).json({
        success: true,
        message: "Profile created successfully",
        profile,
      });
    }

    profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      profileData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("CREATE/UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * GET MY PROFILE
 *
 * Important:
 * If the user has not created a Profile document yet,
 * return a basic profile constructed from their User document.
 *
 * This prevents the /profile page from unnecessarily
 * showing "Profile not found".
 */
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    const profile = await Profile.findOne({
      user: userId,
    }).populate("user", "name email profilePicture lastSeen isOnline");

    if (profile) {
      return res.status(200).json({
        success: true,
        profile,
        isBasicProfile: false,
      });
    }

    /**
     * No Profile document yet.
     * Build a safe fallback from the User document.
     */
    const user = await User.findById(userId).select(
      "name email profilePicture bio skills github linkedin location experience lastSeen isOnline createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const fallbackProfile = {
      user,
      username: "",
      headline: "",
      bio: user.bio || "",
      skills: Array.isArray(user.skills) ? user.skills : [],
      location: user.location || "",
      availability: "",
      experience: [],
      projects: [],
      socialLinks: {
        github: user.github || "",
        linkedin: user.linkedin || "",
        portfolio: "",
        twitter: "",
      },
    };

    return res.status(200).json({
      success: true,
      profile: fallbackProfile,
      isBasicProfile: true,
    });
  } catch (error) {
    console.error("GET MY PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * GET PUBLIC PROFILE
 *
 * If a Profile document exists, return it.
 * Otherwise return a safe public profile based on User.
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const profile = await Profile.findOne({
      user: userId,
    }).populate(
      "user",
      "name email profilePicture lastSeen isOnline"
    );

    if (profile) {
      return res.status(200).json({
        success: true,
        profile,
        isBasicProfile: false,
      });
    }

    const user = await User.findById(userId).select(
      "name email profilePicture bio skills github linkedin location experience lastSeen isOnline createdAt"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const fallbackProfile = {
      user,
      username: "",
      headline: "",
      bio: user.bio || "",
      skills: Array.isArray(user.skills) ? user.skills : [],
      location: user.location || "",
      availability: "",
      experience: [],
      projects: [],
      socialLinks: {
        github: user.github || "",
        linkedin: user.linkedin || "",
        portfolio: "",
        twitter: "",
      },
    };

    return res.status(200).json({
      success: true,
      profile: fallbackProfile,
      isBasicProfile: true,
    });
  } catch (error) {
    console.error("GET PUBLIC PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load public profile",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * GET ALL PROFILES
 */
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate(
        "user",
        "name email profilePicture lastSeen isOnline"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("GET ALL PROFILES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load profiles",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * SEARCH PROFILES
 *
 * Supports:
 * - skill
 * - name
 * - location
 * - availability
 * - page
 * - limit
 * - sort=newest|oldest
 */
export const searchProfilesBySkill = async (req, res) => {
  try {
    const {
      skill,
      name,
      location,
      availability,
      sort,
    } = req.query;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const filter = {};

    /**
     * General developer search
     */
    if (skill?.trim()) {
      const searchText = skill.trim();

      filter.$or = [
        {
          username: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          headline: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          bio: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          skills: {
            $regex: searchText,
            $options: "i",
          },
        },
        {
          location: {
            $regex: searchText,
            $options: "i",
          },
        },
      ];
    }

    /**
     * Explicit name search
     */
    if (name?.trim()) {
      const nameRegex = {
        $regex: name.trim(),
        $options: "i",
      };

      const nameConditions = [
        { username: nameRegex },
        { headline: nameRegex },
        { bio: nameRegex },
      ];

      if (filter.$or) {
        filter.$and = [
          {
            $or: filter.$or,
          },
          {
            $or: nameConditions,
          },
        ];

        delete filter.$or;
      } else {
        filter.$or = nameConditions;
      }
    }

    /**
     * Location filter
     */
    if (location?.trim()) {
      filter.location = {
        $regex: location.trim(),
        $options: "i",
      };
    }

    /**
     * Availability filter
     */
    if (availability?.trim()) {
      filter.availability = availability.trim();
    }

    /**
     * Sorting
     */
    const sortOption =
      sort === "oldest"
        ? { createdAt: 1 }
        : { createdAt: -1 };

    /**
     * Count
     */
    const totalProfiles =
      await Profile.countDocuments(filter);

    /**
     * Paginated results
     */
    const profiles = await Profile.find(filter)
      .populate(
        "user",
        "name email profilePicture lastSeen isOnline"
      )
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalProfiles,
      totalPages: Math.ceil(
        totalProfiles / limit
      ),
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("SEARCH PROFILES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search profiles",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * ADD EXPERIENCE
 */
export const addExperience = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      startDate,
      endDate,
      current,
      description,
    } = req.body;

    if (!title?.trim() || !company?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Experience title and company are required",
      });
    }

    const profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message:
          "Create your developer profile before adding experience",
      });
    }

    const newExperience = {
      title: title.trim(),
      company: company.trim(),
      location: location?.trim() || "",
      startDate,
      endDate,
      current: Boolean(current),
      description: description?.trim() || "",
    };

    profile.experience.unshift(newExperience);

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Experience added successfully",
      profile,
    });
  } catch (error) {
    console.error("ADD EXPERIENCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add experience",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * DELETE EXPERIENCE
 */
export const deleteExperience = async (req, res) => {
  try {
    const { expId } = req.params;

    if (!expId) {
      return res.status(400).json({
        success: false,
        message: "Experience ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(expId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience ID",
      });
    }

    const profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const originalLength =
      profile.experience.length;

    profile.experience =
      profile.experience.filter(
        (experience) =>
          experience._id.toString() !== expId
      );

    if (
      profile.experience.length === originalLength
    ) {
      return res.status(404).json({
        success: false,
        message: "Experience not found",
      });
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Experience deleted successfully",
      profile,
    });
  } catch (error) {
    console.error("DELETE EXPERIENCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete experience",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};