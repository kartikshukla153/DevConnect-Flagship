import express from "express";

import {
  createOrUpdateProfile,
  getMyProfile,
  getUserProfile,
  getAllProfiles,
  
  searchProfilesBySkill,
  addExperience,
  deleteExperience,
} from "../controllers/profileController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * CREATE OR UPDATE PROFILE
 */
router.post("/", authMiddleware, createOrUpdateProfile);

/**
 * ADD EXPERIENCE
 */
router.post("/experience", authMiddleware, addExperience);


/**
 * DELETE EXPERIENCE
 */
router.delete("/experience/:expId", authMiddleware, deleteExperience);

/**
 * GET MY PROFILE
 */
router.get("/me", authMiddleware, getMyProfile);

/**
 * SEARCH PROFILES
 */
router.get("/search/skills", searchProfilesBySkill);

/**
 * GET ALL PROFILES
 */
router.get("/", getAllProfiles);



/**
 * GET PUBLIC PROFILE
 */
router.get("/:userId", getUserProfile);

export default router;