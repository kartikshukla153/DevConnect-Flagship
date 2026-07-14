import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { fixBug } from "../controllers/ai/bugFix.controller.js";

const router = express.Router();

router.post(
  "/fix",
  authMiddleware,
  fixBug
);

export default router;