import express from "express";

import {
  createPost,
  getPosts,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  deletePost,
} from "../controllers/postController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

/*
 * ============================================================
 * CREATE POST
 *
 * multipart/form-data
 * content -> text
 * image   -> optional image
 * ============================================================
 */

router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  createPost
);

/*
 * ============================================================
 * GET POSTS
 * ============================================================
 */

router.get(
  "/",
  authMiddleware,
  getPosts
);

/*
 * ============================================================
 * LIKE / UNLIKE
 * ============================================================
 */

router.put(
  "/like/:id",
  authMiddleware,
  likePost
);

router.put(
  "/unlike/:id",
  authMiddleware,
  unlikePost
);

/*
 * ============================================================
 * COMMENTS
 * ============================================================
 */

router.post(
  "/comment/:id",
  authMiddleware,
  addComment
);

router.delete(
  "/comment/:postId/:commentId",
  authMiddleware,
  deleteComment
);

/*
 * ============================================================
 * DELETE POST
 * ============================================================
 */

router.delete(
  "/:id",
  authMiddleware,
  deletePost
);

export default router;