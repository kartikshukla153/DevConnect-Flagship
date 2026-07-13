import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generateDocs } from "../controllers/ai/generateDocs.controller.js";

const router = express.Router();

router.post(
  "/generate",
  authMiddleware,
  generateDocs
);

export default router;