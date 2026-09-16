import mongoose from "mongoose";

import Profile from "../models/Profile.js";
import User from "../models/User.js";

/* ============================================================
   HELPERS
============================================================ */

const escapeRegex = (value = "") =>
  String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

const normalizeString = (value) =>
  typeof value === "string"
    ? value.trim()
    : "";

const getPagination = (req) => {
  const pageValue = Number(req.query.page);
  const limitValue = Number(req.query.limit);

  const page = Number.isFinite(pageValue)
    ? Math.max(Math.floor(pageValue), 1)
    : 1;

  const limit = Number.isFinite(limitValue)
    ? Math.min(
        Math.max(Math.floor(limitValue), 1),
        50
      )
    : 12;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const publicUserFields =
  "name profilePicture lastSeen isOnline";

const profilePopulation = {
  path: "user",
  select: publicUserFields,
};

const buildFallbackProfile = (user) => ({
  user,
  username: "",
  headline: "",
  bio: user.bio || "",
  skills: Array.isArray(user.skills)
    ? user.skills
    : [],
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
});

/* ============================================================
   CREATE OR UPDATE PROFILE
============================================================ */

export const createOrUpdateProfile = async (
  req,
  res
) => {
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
      username: normalizeString(username),
      headline: normalizeString(headline),
      bio: normalizeString(bio),
      skills: Array.isArray(skills)
        ? skills
            .map((skill) =>
              normalizeString(skill)
            )
            .filter(Boolean)
        : [],
      location: normalizeString(location),
      availability:
        normalizeString(availability),
      socialLinks: {
        github: normalizeString(github),
        linkedin: normalizeString(linkedin),
        portfolio:
          normalizeString(portfolio),
        twitter: normalizeString(twitter),
      },
    };

    let profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      profile = await Profile.create(
        profileData
      );

      return res.status(201).json({
        success: true,
        message:
          "Profile created successfully",
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
    console.error(
      "CREATE/UPDATE PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save profile",
    });
  }
};

/* ============================================================
   GET MY PROFILE
============================================================ */

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user not found",
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

    return res.status(200).json({
      success: true,
      profile: buildFallbackProfile(user),
      isBasicProfile: true,
    });
  } catch (error) {
    console.error(
      "GET MY PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load profile",
    });
  }
};

/* ============================================================
   GET PUBLIC PROFILE
============================================================ */

export const getUserProfile = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
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

    return res.status(200).json({
      success: true,
      profile: buildFallbackProfile(user),
      isBasicProfile: true,
    });
  } catch (error) {
    console.error(
      "GET PUBLIC PROFILE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load public profile",
    });
  }
};

/* ============================================================
   GET ALL PROFILES
============================================================ */

export const getAllProfiles = async (
  req,
  res
) => {
  try {
    const { page, limit, skip } =
      getPagination(req);

    const [totalProfiles, profiles] =
      await Promise.all([
        Profile.countDocuments(),

        Profile.find({})
          .select(
            "-__v"
          )
          .populate(profilePopulation)
          .sort({
            createdAt: -1,
            _id: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),
      ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalProfiles,
      totalPages: Math.max(
        Math.ceil(
          totalProfiles / limit
        ),
        1
      ),
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error(
      "GET ALL PROFILES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load profiles",
    });
  }
};

/* ============================================================
   SEARCH PROFILES
============================================================ */

export const searchProfilesBySkill = async (
  req,
  res
) => {
  try {
    const {
      skill,
      name,
      query,
      location,
      availability,
      sort,
    } = req.query;

    const { page, limit, skip } =
      getPagination(req);

    /*
     * "skill" remains supported for backward
     * compatibility with the existing Developers UI.
     *
     * "query" and "name" are also supported so
     * future consumers can use a clearer API.
     */

    const searchText = normalizeString(
      query || skill || name
    );

    const locationText =
      normalizeString(location);

    const availabilityText =
      normalizeString(availability);

    const filter = {};

    /*
     * Developer search across profile fields.
     */

    if (searchText) {
      const safeSearch =
        escapeRegex(searchText);

      const regex = {
        $regex: safeSearch,
        $options: "i",
      };

      /*
       * Name lives on User, while the other
       * discovery fields live on Profile.
       *
       * Resolve matching user IDs first.
       */

      const matchingUsers =
        await User.find({
          name: regex,
        })
          .select("_id")
          .limit(500)
          .lean();

      const matchingUserIds =
        matchingUsers.map(
          (user) => user._id
        );

      filter.$or = [
        { username: regex },
        { headline: regex },
        { bio: regex },
        { skills: regex },
        { location: regex },
      ];

      if (matchingUserIds.length > 0) {
        filter.$or.push({
          user: {
            $in: matchingUserIds,
          },
        });
      }
    }

    if (locationText) {
      filter.location = {
        $regex: escapeRegex(
          locationText
        ),
        $options: "i",
      };
    }

    if (availabilityText) {
      filter.availability = {
        $regex: escapeRegex(
          availabilityText
        ),
        $options: "i",
      };
    }

    const sortOption =
      sort === "oldest"
        ? {
            createdAt: 1,
            _id: 1,
          }
        : {
            createdAt: -1,
            _id: -1,
          };

    const [
      totalProfiles,
      profiles,
    ] = await Promise.all([
      Profile.countDocuments(filter),

      Profile.find(filter)
        .select("-__v")
        .populate(profilePopulation)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalProfiles,
      totalPages: Math.max(
        Math.ceil(
          totalProfiles / limit
        ),
        1
      ),
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error(
      "SEARCH PROFILES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to search profiles",
    });
  }
};

/* ============================================================
   ADD EXPERIENCE
============================================================ */

export const addExperience = async (
  req,
  res
) => {
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

    if (
      !title?.trim() ||
      !company?.trim()
    ) {
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
      location:
        location?.trim() || "",
      startDate,
      endDate,
      current: Boolean(current),
      description:
        description?.trim() || "",
    };

    profile.experience.unshift(
      newExperience
    );

    await profile.save();

    return res.status(200).json({
      success: true,
      message:
        "Experience added successfully",
      profile,
    });
  } catch (error) {
    console.error(
      "ADD EXPERIENCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add experience",
    });
  }
};

/* ============================================================
   DELETE EXPERIENCE
============================================================ */

export const deleteExperience = async (
  req,
  res
) => {
  try {
    const { expId } = req.params;

    if (!expId) {
      return res.status(400).json({
        success: false,
        message:
          "Experience ID is required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(expId)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid experience ID",
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
          experience._id.toString() !==
          expId
      );

    if (
      profile.experience.length ===
      originalLength
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Experience not found",
      });
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message:
        "Experience deleted successfully",
      profile,
    });
  } catch (error) {
    console.error(
      "DELETE EXPERIENCE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete experience",
    });
  }
};