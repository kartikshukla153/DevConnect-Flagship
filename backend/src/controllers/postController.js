import Post from "../models/Post.js";
import createNotification from "../utils/createNotification.js";
import cloudinary from "../config/cloudinary.js";

/*
 * ============================================================
 * CLOUDINARY CONFIGURATION SAFETY
 * ============================================================
 *
 * The post image upload was failing with:
 *
 *   Error: Must supply api_key
 *
 * This controller explicitly ensures the Cloudinary SDK has
 * the required credentials before attempting an upload.
 *
 * Supported environment variable names:
 *
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * And the standard:
 *
 *   CLOUDINARY_URL
 *
 * If config/cloudinary.js already configured Cloudinary,
 * this simply preserves that configuration.
 * ============================================================
 */

const configureCloudinary = () => {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_NAME ||
    "";

  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_KEY ||
    "";

  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_SECRET ||
    "";

  /*
   * CLOUDINARY_URL is handled by Cloudinary itself when
   * supplied through the environment.
   *
   * Only explicitly configure when individual credentials
   * are available.
   */

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
  }

  return cloudinary.config();
};

/*
 * ============================================================
 * CLOUDINARY BUFFER UPLOAD
 * ============================================================
 */

const uploadBufferToCloudinary = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error(
      "Invalid image buffer received"
    );
  }

  const config = configureCloudinary();

  /*
   * Fail early with a useful backend error instead of allowing
   * Cloudinary to throw the vague "Must supply api_key" error.
   */

  if (
    !config?.cloud_name ||
    !config?.api_key ||
    !config?.api_secret
  ) {
    throw new Error(
      "Cloudinary is not configured. Missing cloud_name, api_key, or api_secret."
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "devconnect/posts",

          resource_type: "image",

          transformation: [
            {
              width: 1600,
              height: 1600,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },

        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(
              new Error(
                "Cloudinary returned an empty upload result"
              )
            );
          }

          resolve(result);
        }
      );

    uploadStream.end(buffer);
  });
};

/**
 * ============================================================
 * CREATE POST
 * ============================================================
 */

export const createPost = async (req, res) => {
  try {
    const content =
      typeof req.body?.content === "string"
        ? req.body.content.trim()
        : "";

    const hasImage = Boolean(req.file);

    /*
     * A post must contain either text or an image.
     */

    if (!content && !hasImage) {
      return res.status(400).json({
        success: false,
        message:
          "Post content or image is required",
      });
    }

    /*
     * Maximum post text length.
     */

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message:
          "Post content cannot exceed 5000 characters",
      });
    }

    /*
     * ==========================================================
     * IMAGE UPLOAD
     * ==========================================================
     */

    let imageData = null;

    if (req.file) {
      try {
        console.log(
          "POST IMAGE UPLOAD START:",
          {
            originalname:
              req.file.originalname,
            mimetype:
              req.file.mimetype,
            size:
              req.file.size,
          }
        );

        const uploadedImage =
          await uploadBufferToCloudinary(
            req.file.buffer
          );

        imageData = {
          url:
            uploadedImage.secure_url ||
            uploadedImage.url ||
            "",

          publicId:
            uploadedImage.public_id ||
            "",

          width:
            uploadedImage.width ||
            null,

          height:
            uploadedImage.height ||
            null,

          format:
            uploadedImage.format ||
            "",
        };

        /*
         * Make absolutely sure we never create a post
         * with an invalid image object.
         */

        if (!imageData.url) {
          throw new Error(
            "Cloudinary upload succeeded but no image URL was returned"
          );
        }

        console.log(
          "POST IMAGE UPLOAD SUCCESS:",
          {
            publicId:
              imageData.publicId,
            url:
              imageData.url,
          }
        );
      } catch (uploadError) {
        console.error(
          "CLOUDINARY IMAGE UPLOAD ERROR:",
          uploadError
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to upload post image",
          error:
            process.env.NODE_ENV ===
            "development"
              ? uploadError.message
              : undefined,
        });
      }
    }

    /*
     * ==========================================================
     * CREATE POST
     * ==========================================================
     */

    const post = await Post.create({
      content,
      user: req.user._id,

      ...(imageData
        ? {
            image: imageData,
          }
        : {}),
    });

    /*
     * ==========================================================
     * POPULATE POST
     * ==========================================================
     */

    const populatedPost =
      await Post.findById(post._id)
        .populate(
          "user",
          "name email profilePicture avatar isOnline"
        )
        .populate(
          "comments.user",
          "name email profilePicture avatar"
        );

    /*
     * ==========================================================
     * RESPONSE
     * ==========================================================
     */

    return res.status(201).json({
      success: true,
      message:
        "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error(
      "CREATE POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create post",
    });
  }
};

/**
 * ============================================================
 * GET ALL POSTS
 * ============================================================
 */

export const getPosts = async (req, res) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 10,
        1
      ),
      50
    );

    const totalPosts =
      await Post.countDocuments();

    const posts =
      await Post.find()
        .populate(
          "user",
          "name email profilePicture avatar isOnline"
        )
        .populate(
          "comments.user",
          "name email profilePicture avatar"
        )
        .sort({
          createdAt: -1,
        })
        .skip(
          (page - 1) * limit
        )
        .limit(limit)
        .lean();

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalPosts,
      totalPages: Math.ceil(
        totalPosts / limit
      ),
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error(
      "GET POSTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch posts",
    });
  }
};

/**
 * ============================================================
 * LIKE POST
 * ============================================================
 */

export const likePost = async (req, res) => {
  try {
    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message:
          "Post not found",
      });
    }

    const alreadyLiked =
      post.likes.some(
        (userId) =>
          userId.toString() ===
          req.user._id.toString()
      );

    if (alreadyLiked) {
      return res.status(400).json({
        success: false,
        message:
          "Post already liked",
      });
    }

    post.likes.push(
      req.user._id
    );

    await post.save();

    if (
      post.user.toString() !==
      req.user._id.toString()
    ) {
      await createNotification({
        recipient: post.user,
        sender: req.user._id,
        type: "post_like",
        message:
          "liked your post",
        relatedPost: post._id,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Post liked successfully",
      likesCount:
        post.likes.length,
    });
  } catch (error) {
    console.error(
      "LIKE POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to like post",
    });
  }
};

/**
 * ============================================================
 * UNLIKE POST
 * ============================================================
 */

export const unlikePost = async (
  req,
  res
) => {
  try {
    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message:
          "Post not found",
      });
    }

    post.likes =
      post.likes.filter(
        (userId) =>
          userId.toString() !==
          req.user._id.toString()
      );

    await post.save();

    return res.status(200).json({
      success: true,
      message:
        "Post unliked successfully",
      likesCount:
        post.likes.length,
    });
  } catch (error) {
    console.error(
      "UNLIKE POST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to unlike post",
    });
  }
};

/**
 * ============================================================
 * ADD COMMENT
 * ============================================================
 */

export const addComment = async (
  req,
  res
) => {
  try {
    const { text } =
      req.body;

    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Comment text is required",
      });
    }

    const trimmedText =
      text.trim();

    if (
      trimmedText.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Comment cannot exceed 2000 characters",
      });
    }

    const post =
      await Post.findById(
        req.params.id
      );

    if (!post) {
      return res.status(404).json({
        success: false,
        message:
          "Post not found",
      });
    }

    post.comments.unshift({
      user: req.user._id,
      text: trimmedText,
    });

    await post.save();

    if (
      post.user.toString() !==
      req.user._id.toString()
    ) {
      await createNotification({
        recipient: post.user,
        sender: req.user._id,
        type: "post_comment",
        message:
          "commented on your post",
        relatedPost: post._id,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Comment added successfully",
      comments:
        post.comments,
    });
  } catch (error) {
    console.error(
      "ADD COMMENT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to add comment",
    });
  }
};

/**
 * ============================================================
 * DELETE COMMENT
 * ============================================================
 */

export const deleteComment =
  async (req, res) => {
    try {
      const {
        postId,
        commentId,
      } = req.params;

      const post =
        await Post.findById(
          postId
        );

      if (!post) {
        return res.status(404).json({
          success: false,
          message:
            "Post not found",
        });
      }

      const comment =
        post.comments.id(
          commentId
        );

      if (!comment) {
        return res.status(404).json({
          success: false,
          message:
            "Comment not found",
        });
      }

      if (
        comment.user.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to delete this comment",
        });
      }

      comment.deleteOne();

      await post.save();

      return res.status(200).json({
        success: true,
        message:
          "Comment deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE COMMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete comment",
      });
    }
  };

/**
 * ============================================================
 * DELETE POST
 * ============================================================
 */

export const deletePost =
  async (req, res) => {
    try {
      const post =
        await Post.findById(
          req.params.id
        );

      if (!post) {
        return res.status(404).json({
          success: false,
          message:
            "Post not found",
        });
      }

      const isOwner =
        post.user.toString() ===
        req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized to delete this post",
        });
      }

      /*
       * ========================================================
       * DELETE CLOUDINARY IMAGE
       * ========================================================
       */

      if (
        post.image?.publicId
      ) {
        try {
          const config =
            configureCloudinary();

          if (
            config?.cloud_name &&
            config?.api_key &&
            config?.api_secret
          ) {
            await cloudinary.uploader.destroy(
              post.image.publicId,
              {
                resource_type:
                  "image",
              }
            );
          }
        } catch (
          cloudinaryError
        ) {
          /*
           * Don't block deletion of the database
           * record if Cloudinary cleanup fails.
           */

          console.error(
            "CLOUDINARY DELETE ERROR:",
            cloudinaryError
          );
        }
      }

      /*
       * ========================================================
       * DELETE DATABASE POST
       * ========================================================
       */

      await Post.findByIdAndDelete(
        post._id
      );

      return res.status(200).json({
        success: true,
        message:
          "Post deleted successfully",
        postId:
          post._id,
      });
    } catch (error) {
      console.error(
        "DELETE POST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete post",
      });
    }
  };