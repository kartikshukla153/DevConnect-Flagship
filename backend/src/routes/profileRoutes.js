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

/*
|--------------------------------------------------------------------------
| Create / Update
|--------------------------------------------------------------------------
*/

router.post(
  "/",
  authMiddleware,
  createOrUpdateProfile
);

/*
|--------------------------------------------------------------------------
| Experience
|--------------------------------------------------------------------------
*/

router.post(
  "/experience",
  authMiddleware,
  addExperience
);

router.delete(
  "/experience/:expId",
  authMiddleware,
  deleteExperience
);

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  authMiddleware,
  getMyProfile
);

/*
|--------------------------------------------------------------------------
| Developer Discovery
|--------------------------------------------------------------------------
|
| Keep these BEFORE /:userId.
|
|--------------------------------------------------------------------------
*/

router.get(
  "/search/skills",
  searchProfilesBySkill
);

router.get(
  "/",
  getAllProfiles
);

/*
|--------------------------------------------------------------------------
| Public Developer Profile
|--------------------------------------------------------------------------
*/

router.get(
  "/:userId",
  getUserProfile
);

export default router;