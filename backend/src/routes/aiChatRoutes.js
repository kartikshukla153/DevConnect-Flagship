import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { chatWithProject } from "../controllers/ai/chat.controller.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  chatWithProject
);

export default router;