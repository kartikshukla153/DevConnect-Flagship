import express from "express";

import {
  registerUser,
  loginUser,
} from "../controllers/authController.js";

import {
  authRateLimiter,
} from "../middleware/rateLimiter.js";

const router = express.Router();

/*
 * Authentication endpoints
 *
 * These routes are intentionally rate-limited because
 * registration and login are common targets for abuse,
 * brute-force attempts, and automated requests.
 */

router.post(
  "/register",
  authRateLimiter,
  registerUser
);

router.post(
  "/login",
  authRateLimiter,
  loginUser
);

export default router;