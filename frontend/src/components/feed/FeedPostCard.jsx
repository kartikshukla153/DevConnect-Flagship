import {
  Heart,
  MessageCircle,
  Clock3,
  Send,
  MoreHorizontal,
  Globe2,
  Trash2,
  X,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function formatRelativeTime(dateValue) {
  if (!dateValue) return "Recently";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const seconds = Math.floor(
    (Date.now() - date.getTime()) / 1000
  );

  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}

function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem("user") || "{}"
    );
  } catch {
    return {};
  }
}

function getId(value) {
  if (!value) return null;

  if (typeof value === "string") {
    return value;
  }

  return value._id || value.id || null;
}

function FeedPostCard({
  post,
  likePost,
  commentText,
  setCommentText,
  addComment,
  onDeletePost,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] =
    useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllComments, setShowAllComments] =
    useState(false);

  const menuRef = useRef(null);

  const user = getUser();

  const currentUserId = getId(user);

  /*
   * ============================================================
   * USER / AUTHOR DATA
   * ============================================================
   */

  const authorName =
    post.user?.name ||
    post.author?.name ||
    "Developer";

  const authorId =
    getId(post.user) ||
    getId(post.author);

  const authorAvatar =
    post.user?.profilePicture ||
    post.user?.avatar ||
    post.author?.profilePicture ||
    post.author?.avatar ||
    "";

  const avatarLetter = authorName
    .charAt(0)
    .toUpperCase();

  const isOwner =
    currentUserId &&
    authorId &&
    String(currentUserId) === String(authorId);

  /*
   * ============================================================
   * IMAGE DATA
   *
   * Backend returns:
   *
   * image: {
   *   url,
   *   publicId,
   *   width,
   *   height,
   *   format
   * }
   *
   * NOT:
   *
   * imageUrl
   * ============================================================
   */

  const imageUrl =
    post.image?.url ||
    post.image?.secure_url ||
    post.imageUrl ||
    "";

  const hasImage = Boolean(imageUrl);

  /*
   * ============================================================
   * ENGAGEMENT DATA
   * ============================================================
   */

  const likes = Array.isArray(post.likes)
    ? post.likes
    : [];

  const comments = Array.isArray(post.comments)
    ? post.comments
    : [];

  const likedByCurrentUser = likes.some((like) => {
    const likeId = getId(like);

    return (
      likeId &&
      currentUserId &&
      String(likeId) === String(currentUserId)
    );
  });

  const likesCount = likes.length;
  const commentsCount = comments.length;

  const visibleComments = showAllComments
    ? comments
    : comments.slice(-3);

  /*
   * ============================================================
   * CLOSE MENU ON OUTSIDE CLICK
   * ============================================================
   */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * ============================================================
   * LIKE
   * ============================================================
   */

  const handleLike = async () => {
    if (liking || !likePost) return;

    try {
      setLiking(true);
      await likePost(post._id);
    } catch (error) {
      console.error(
        "LIKE POST UI ERROR:",
        error
      );
    } finally {
      setLiking(false);
    }
  };

  /*
   * ============================================================
   * COMMENT
   * ============================================================
   */

  const handleComment = async () => {
    const text = commentText[post._id];

    if (!text?.trim() || commenting) {
      return;
    }

    try {
      setCommenting(true);
      await addComment(post._id);
    } catch (error) {
      console.error(
        "COMMENT POST UI ERROR:",
        error
      );
    } finally {
      setCommenting(false);
    }
  };

  /*
   * ============================================================
   * DELETE
   * ============================================================
   */

  const handleDelete = async () => {
    if (!onDeletePost || deleting) {
      return;
    }

    try {
      setDeleting(true);

      await onDeletePost(post._id);

      setDeleteConfirmOpen(false);
      setMenuOpen(false);
    } catch (error) {
      console.error(
        "DELETE POST UI ERROR:",
        error
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * ============================================================
   * COPY POST
   * ============================================================
   */

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        post.content || ""
      );

      setCopied(true);
      setMenuOpen(false);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error(
        "COPY POST ERROR:",
        error
      );
    }
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <>
      <article
        className={`group relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0F172A] transition-all duration-300 ${
          deleting
            ? "pointer-events-none opacity-60"
            : "hover:border-white/[0.13] hover:shadow-2xl hover:shadow-black/20"
        }`}
      >
        {/* ======================================================
            TOP ACCENT
            ====================================================== */}

        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* ======================================================
            HEADER
            ====================================================== */}

        <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3.5">
            {/* Avatar */}

            <div className="relative shrink-0">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt=""
                  className="h-12 w-12 rounded-2xl object-cover ring-1 ring-white/[0.08]"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-base font-black text-[#07131E] shadow-lg shadow-cyan-500/10">
                  {avatarLetter}
                </div>
              )}

              {post.user?.isOnline && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-[#0F172A] bg-emerald-400" />
              )}
            </div>

            {/* Author */}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-bold text-white sm:text-[15px]">
                  {authorName}
                </h3>

                <span className="rounded-full border border-cyan-500/15 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-400">
                  Developer
                </span>

                {isOwner && (
                  <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    You
                  </span>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                <Clock3 size={11} />

                <span>
                  {formatRelativeTime(
                    post.createdAt
                  )}
                </span>

                <span>·</span>

                <Globe2 size={11} />

                <span>Public</span>

                {post.updatedAt &&
                  post.createdAt &&
                  new Date(
                    post.updatedAt
                  ).getTime() >
                    new Date(
                      post.createdAt
                    ).getTime() + 3000 && (
                    <>
                      <span>·</span>
                      <span>Edited</span>
                    </>
                  )}
              </div>
            </div>
          </div>

          {/* ====================================================
              POST MENU
              ==================================================== */}

          <div
            ref={menuRef}
            className="relative shrink-0"
          >
            <button
              type="button"
              aria-label="Post options"
              aria-expanded={menuOpen}
              onClick={() =>
                setMenuOpen(
                  (previous) => !previous
                )
              }
              className={`rounded-xl p-2 transition-all duration-200 ${
                menuOpen
                  ? "bg-white/[0.07] text-white"
                  : "text-slate-600 hover:bg-white/[0.05] hover:text-slate-300"
              }`}
            >
              <MoreHorizontal size={19} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-11 z-40 w-48 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111827] p-1.5 shadow-2xl shadow-black/50">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
                >
                  {copied ? (
                    <Check
                      size={16}
                      className="text-emerald-400"
                    />
                  ) : (
                    <Copy size={16} />
                  )}

                  {copied
                    ? "Copied"
                    : "Copy post"}
                </button>

                {isOwner && (
                  <>
                    <div className="my-1 border-t border-white/[0.06]" />

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setDeleteConfirmOpen(true);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                      Delete post
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            POST CONTENT
            ====================================================== */}

        {(post.content || hasImage) && (
          <div className="px-5 py-6 sm:px-6">
            {/* TEXT */}

            {post.content && (
              <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-200">
                {post.content}
              </p>
            )}

            {/* IMAGE */}

            {hasImage && (
              <div
                className={
                  post.content
                    ? "mt-5"
                    : ""
                }
              >
                <div className="group/image relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1220]">
                  <img
                    src={imageUrl}
                    alt="Post attachment"
                    loading="lazy"
                    className="block max-h-[650px] w-full object-contain transition-transform duration-300 group-hover/image:scale-[1.01]"
                    onError={(event) => {
                      console.error(
                        "POST IMAGE DISPLAY ERROR:",
                        imageUrl
                      );

                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            ENGAGEMENT SUMMARY
            ====================================================== */}

        {(likesCount > 0 ||
          commentsCount > 0) && (
          <div className="flex items-center justify-between border-y border-white/[0.07] px-5 py-3 sm:px-6">
            <div className="flex items-center gap-4">
              {likesCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10">
                    <Heart
                      size={11}
                      className="text-red-400"
                      fill="currentColor"
                    />
                  </span>

                  <strong className="font-semibold text-slate-300">
                    {likesCount}
                  </strong>

                  <span>
                    {likesCount === 1
                      ? "like"
                      : "likes"}
                  </span>
                </span>
              )}

              {commentsCount > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllComments(true)
                  }
                  className="text-xs text-slate-500 transition hover:text-slate-300"
                >
                  <strong className="font-semibold text-slate-300">
                    {commentsCount}
                  </strong>{" "}
                  {commentsCount === 1
                    ? "comment"
                    : "comments"}
                </button>
              )}
            </div>

            <span className="hidden text-[10px] uppercase tracking-wider text-slate-700 sm:block">
              Developer discussion
            </span>
          </div>
        )}

        {/* ======================================================
            ACTIONS
            ====================================================== */}

        <div className="grid grid-cols-2 gap-2 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            className={`group/like flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-all duration-200 ${
              likedByCurrentUser
                ? "border-red-500/25 bg-red-500/10 text-red-400"
                : "border-white/[0.07] bg-[#0B1220] text-slate-400 hover:border-red-500/20 hover:bg-red-500/[0.07] hover:text-red-400"
            }`}
          >
            <Heart
              size={17}
              className={`transition-transform duration-200 ${
                liking
                  ? "scale-75"
                  : "group-hover/like:scale-110"
              }`}
              fill={
                likedByCurrentUser
                  ? "currentColor"
                  : "none"
              }
            />

            {likedByCurrentUser
              ? "Liked"
              : "Like"}
          </button>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById(
                  `comment-${post._id}`
                )
                ?.focus();
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.07] bg-[#0B1220] py-3 text-sm font-semibold text-slate-400 transition-all duration-200 hover:border-cyan-500/20 hover:bg-cyan-500/[0.07] hover:text-cyan-400"
          >
            <MessageCircle size={17} />
            Comment
          </button>
        </div>

        {/* ======================================================
            COMMENTS
            ====================================================== */}

        {comments.length > 0 && (
          <div className="space-y-2.5 px-5 pb-5 sm:px-6">
            {!showAllComments &&
              comments.length > 3 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllComments(true)
                  }
                  className="mb-1 px-1 text-xs font-medium text-slate-600 transition hover:text-cyan-400"
                >
                  View all {comments.length} comments
                </button>
              )}

            {visibleComments.map((comment) => {
              const commentAuthor =
                comment.user?.name ||
                "Developer";

              const commentAvatar =
                comment.user?.profilePicture ||
                comment.user?.avatar ||
                "";

              return (
                <div
                  key={comment._id}
                  className="rounded-2xl border border-white/[0.06] bg-[#0B1220] p-4 transition-colors duration-200 hover:border-white/[0.09]"
                >
                  <div className="flex items-start gap-3">
                    {commentAvatar ? (
                      <img
                        src={commentAvatar}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-sm font-bold text-cyan-300">
                        {commentAuthor
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-white">
                          {commentAuthor}
                        </h4>

                        <span className="text-[11px] text-slate-600">
                          ·{" "}
                          {formatRelativeTime(
                            comment.createdAt
                          )}
                        </span>
                      </div>

                      <p className="mt-1.5 break-words text-sm leading-6 text-slate-400">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================
            COMMENT COMPOSER
            ====================================================== */}

        <div className="border-t border-white/[0.07] bg-[#0B1220]/40 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-xs font-bold text-cyan-300 sm:flex">
              {(user.name || "D")
                .charAt(0)
                .toUpperCase()}
            </div>

            <input
              id={`comment-${post._id}`}
              value={
                commentText[post._id] || ""
              }
              onChange={(event) =>
                setCommentText((prev) => ({
                  ...prev,
                  [post._id]:
                    event.target.value,
                }))
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  handleComment();
                }
              }}
              placeholder="Add to the discussion..."
              disabled={commenting}
              className="min-w-0 flex-1 rounded-2xl border border-white/[0.07] bg-[#0F172A] px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-600 focus:border-cyan-500/35 focus:bg-[#101B2D] disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              onClick={handleComment}
              disabled={
                !commentText[
                  post._id
                ]?.trim() || commenting
              }
              className="flex h-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 px-4 text-[#07131E] transition-all duration-200 hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/15 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-25 disabled:shadow-none"
              aria-label="Send comment"
            >
              {commenting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07131E]/30 border-t-[#07131E]" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </div>

          <div className="mt-2 hidden justify-end sm:flex">
            <span className="text-[10px] text-slate-700">
              Press Enter to comment
            </span>
          </div>
        </div>
      </article>

      {/* ========================================================
          DELETE CONFIRMATION
          ======================================================== */}

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#111827] shadow-2xl shadow-black/60">
            <div className="flex items-start justify-between border-b border-white/[0.07] px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                  <AlertTriangle
                    size={19}
                    className="text-red-400"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-white">
                    Delete this post?
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This permanently removes the
                    post and its comments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmOpen(false)
                }
                disabled={deleting}
                className="rounded-xl p-2 text-slate-600 transition hover:bg-white/[0.05] hover:text-white"
                aria-label="Close confirmation"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl border border-white/[0.06] bg-[#0B1220] px-4 py-3.5">
                {post.content && (
                  <p className="line-clamp-4 whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                    {post.content}
                  </p>
                )}

                {hasImage && (
                  <img
                    src={imageUrl}
                    alt="Post attachment"
                    className={`max-h-48 w-full rounded-xl object-cover ${
                      post.content
                        ? "mt-3"
                        : ""
                    }`}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/[0.07] px-6 py-5">
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirmOpen(false)
                }
                disabled={deleting}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex min-w-[125px] items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FeedPostCard;