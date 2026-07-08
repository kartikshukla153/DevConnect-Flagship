import express from "express";

import {
  createPost,
  getPosts,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
} from "../controllers/postController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createPost);

router.get("/", authMiddleware, getPosts);

router.put("/like/:id", authMiddleware, likePost);

router.put("/unlike/:id", authMiddleware, unlikePost);

router.post("/comment/:id", authMiddleware, addComment);

router.delete(
  "/comment/:postId/:commentId",
  authMiddleware,
  deleteComment
);

export default router;