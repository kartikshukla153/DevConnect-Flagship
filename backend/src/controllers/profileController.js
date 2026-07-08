import Profile from "../models/Profile.js";

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

    let profile = await Profile.findOne({
      user: req.user.id,
    });

    const profileData = {
      user: req.user.id,
      username,
      headline,
      bio,
      skills,
      location,
      availability,

      socialLinks: {
        github,
        linkedin,
        portfolio,
        twitter,
      },
    };

    if (!profile) {
      profile = await Profile.create(profileData);

      return res.status(201).json({
        success: true,
        message: "Profile created successfully",
        profile,
      });
    }

    profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      profileData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET MY PROFILE
 */
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user._id,
    }).populate("user", "name email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET PUBLIC PROFILE
 */
export const getUserProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", "name email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET ALL PROFILES
 */
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * SEARCH PROFILES
 * Supports:
 * skill
 * name
 * location
 * availability
 * page
 * limit
 * sort=newest|oldest
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

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = {};

    if (skill) {
      filter.skills = {
        $regex: skill,
        $options: "i",
      };
    }

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (availability) {
      filter.availability = availability;
    }

    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    let profiles = await Profile.find(filter)
      .populate("user", "name email")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    if (name) {
      profiles = profiles.filter((profile) =>
        profile.user.name
          .toLowerCase()
          .includes(name.toLowerCase())
      );
    }

   const totalProfiles = await Profile.countDocuments(filter);

res.status(200).json({
  success: true,
  page,
  limit,
  totalProfiles,
  totalPages: Math.ceil(totalProfiles / limit),
  count: profiles.length,
  profiles,
});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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

    const profile = await Profile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const newExperience = {
      title,
      company,
      location,
      startDate,
      endDate,
      current,
      description,
    };

    profile.experience.unshift(newExperience);

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Experience added successfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE EXPERIENCE
 */
export const deleteExperience = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const expId = req.params.expId;

    if (!expId) {
      return res.status(400).json({
        success: false,
        message: "Experience ID is required",
      });
    }

    const originalLength = profile.experience.length;

    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== expId
    );

    if (profile.experience.length === originalLength) {
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
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};