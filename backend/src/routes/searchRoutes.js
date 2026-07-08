import express from "express";

import {
  searchUsers,
  searchPosts,
  searchProjects,
  discoverDevelopers,
} from "../controllers/searchController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", authMiddleware, searchUsers);

router.get("/posts", authMiddleware, searchPosts);

router.get("/projects", authMiddleware, searchProjects);

router.get("/discover", authMiddleware, discoverDevelopers);

export default router;