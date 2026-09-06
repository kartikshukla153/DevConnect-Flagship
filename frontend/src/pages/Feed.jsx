import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import FeedStats from "../components/feed/FeedStats";
import PostComposer from "../components/feed/PostComposer";
import FeedPostCard from "../components/feed/FeedPostCard";
import FeedRightSidebar from "../components/feed/FeedRightSidebar";

const API = "http://localhost:5000/api";

function FeedLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0F172A]">
        <div className="animate-pulse p-6">
          <div className="h-5 w-32 rounded bg-white/[0.05]" />
          <div className="mt-3 h-3 w-64 rounded bg-white/[0.04]" />
          <div className="mt-6 h-32 rounded-2xl bg-white/[0.025]" />
        </div>
      </div>

      {[1, 2].map((item) => (
        <article
          key={item}
          className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0F172A]"
        >
          <div className="animate-pulse">
            <div className="flex items-center gap-4 border-b border-white/[0.06] px-6 py-5">
              <div className="h-12 w-12 rounded-2xl bg-white/[0.05]" />

              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-white/[0.05]" />
                <div className="mt-2 h-3 w-24 rounded bg-white/[0.035]" />
              </div>
            </div>

            <div className="space-y-3 px-6 py-7">
              <div className="h-3 w-full rounded bg-white/[0.035]" />
              <div className="h-3 w-[92%] rounded bg-white/[0.035]" />
              <div className="h-3 w-[68%] rounded bg-white/[0.035]" />
            </div>

            <div className="border-y border-white/[0.06] px-6 py-4">
              <div className="h-3 w-32 rounded bg-white/[0.035]" />
            </div>

            <div className="grid grid-cols-2 gap-2 px-6 py-4">
              <div className="h-11 rounded-2xl bg-white/[0.025]" />
              <div className="h-11 rounded-2xl bg-white/[0.025]" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function FeedErrorState({ onRetry }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-red-500/15 bg-[#0F172A]">
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/15 bg-red-500/10">
          <span className="text-xl font-bold text-red-400">
            !
          </span>
        </div>

        <h3 className="mt-5 text-lg font-bold text-white">
          We couldn't load your feed
        </h3>

        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          Something went wrong while loading the latest developer
          activity. Try again and we'll reconnect to the feed.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-cyan-500/25 hover:bg-cyan-500/10 hover:text-cyan-300"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function FeedEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0F172A]">
      <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-500/[0.06] blur-3xl" />

      <div className="relative flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/15 bg-cyan-500/10">
          <span className="text-2xl font-black text-cyan-400">
            D
          </span>
        </div>

        <h3 className="mt-6 text-2xl font-bold tracking-tight text-white">
          Your developer feed starts here
        </h3>

        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
          Share what you're building, document an engineering
          decision, or start a conversation with other developers.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-slate-500">
            Build in public
          </span>

          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-slate-500">
            Share knowledge
          </span>

          <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-slate-500">
            Meet developers
          </span>
        </div>
      </div>
    </div>
  );
}

function Feed() {
  const [posts, setPosts] = useState([]);
  const [commentText, setCommentText] = useState({});

  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState("");

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  const authConfig = token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : null;

  /*
   * ============================================================
   * FETCH FEED
   * ============================================================
   */

  const fetchPosts = useCallback(
    async ({ showLoader = true } = {}) => {
      if (!token) {
        setPosts([]);
        setFeedError("Authentication required.");
        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        setFeedError("");

        const res = await axios.get(
          `${API}/posts`,
          authConfig
        );

        setPosts(
          Array.isArray(res.data?.posts)
            ? res.data.posts
            : []
        );
      } catch (err) {
        console.error(
          "FETCH POSTS ERROR:",
          err.response?.data || err.message
        );

        setFeedError(
          err.response?.data?.message ||
            "Unable to load the feed."
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

const createPost = async (formData) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    "";

  if (!token) {
    throw new Error(
      "Authentication required."
    );
  }

  const response = await fetch(
    `${API}/posts`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );

  const rawText = await response.text();

  let data = {};

  try {
    data = rawText
      ? JSON.parse(rawText)
      : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        rawText ||
        `Failed to create post (${response.status})`
    );
  }

  if (data?.post) {
    setPosts((previous) => [
      data.post,
      ...previous,
    ]);
  } else {
    await fetchPosts({
      showLoader: false,
    });
  }

  return data;
};

  /*
   * ============================================================
   * LIKE / UNLIKE
   * ============================================================
   */

  const likePost = async (postId) => {
    if (!token || !postId) return;

    try {
      const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const currentUserId =
        currentUser._id || currentUser.id;

      if (!currentUserId) return;

      const post = posts.find(
        (item) => item._id === postId
      );

      if (!post) return;

      const existingLikes = Array.isArray(post.likes)
        ? post.likes
        : [];

      const alreadyLiked = existingLikes.some(
        (like) => {
          const likeId =
            typeof like === "string"
              ? like
              : like?._id || like?.id;

          return (
            String(likeId) ===
            String(currentUserId)
          );
        }
      );

      setPosts((prev) =>
        prev.map((item) => {
          if (item._id !== postId) {
            return item;
          }

          const likes = Array.isArray(item.likes)
            ? item.likes
            : [];

          if (alreadyLiked) {
            return {
              ...item,
              likes: likes.filter((like) => {
                const likeId =
                  typeof like === "string"
                    ? like
                    : like?._id || like?.id;

                return (
                  String(likeId) !==
                  String(currentUserId)
                );
              }),
            };
          }

          return {
            ...item,
            likes: [
              ...likes,
              currentUserId,
            ],
          };
        })
      );

      if (alreadyLiked) {
        await axios.put(
          `${API}/posts/unlike/${postId}`,
          {},
          authConfig
        );
      } else {
        await axios.put(
          `${API}/posts/like/${postId}`,
          {},
          authConfig
        );
      }
    } catch (err) {
      console.error(
        "LIKE POST ERROR:",
        err.response?.data || err.message
      );

      await fetchPosts({
        showLoader: false,
      });
    }
  };

  /*
   * ============================================================
   * COMMENT
   * ============================================================
   */

  const addComment = async (postId) => {
    if (!token || !postId) return;

    try {
      const text = commentText[postId];

      if (!text?.trim()) return;

      const res = await axios.post(
        `${API}/posts/comment/${postId}`,
        {
          text: text.trim(),
        },
        authConfig
      );

      if (Array.isArray(res.data?.comments)) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? {
                  ...post,
                  comments: res.data.comments,
                }
              : post
          )
        );
      } else {
        await fetchPosts({
          showLoader: false,
        });
      }

      setCommentText((prev) => ({
        ...prev,
        [postId]: "",
      }));
    } catch (err) {
      console.error(
        "ADD COMMENT ERROR:",
        err.response?.data || err.message
      );

      throw err;
    }
  };

  /*
   * ============================================================
   * DELETE POST
   * ============================================================
   */

  const deletePost = async (postId) => {
    if (!token || !postId) return;

    try {
      await axios.delete(
        `${API}/posts/${postId}`,
        authConfig
      );

      setPosts((prev) =>
        prev.filter(
          (post) => post._id !== postId
        )
      );

      setCommentText((prev) => {
        const next = {
          ...prev,
        };

        delete next[postId];

        return next;
      });
    } catch (err) {
      console.error(
        "DELETE POST ERROR:",
        err.response?.data || err.message
      );

      throw err;
    }
  };

  const retryFeed = () => {
    fetchPosts();
  };

  return (
    <div className="min-h-full pb-10">
      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/40" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Developer Network
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Developer Feed
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Follow what developers are building, learning, and
            shipping.
          </p>
        </div>

        {!loading && !feedError && (
          <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Live activity
            </span>
          </div>
        )}
      </div>

      {/* STATS */}

      <div className="mb-8">
        <FeedStats />
      </div>

      {/* GRID */}

      <div className="grid grid-cols-12 gap-8">
        <main className="col-span-12 space-y-8 xl:col-span-8">
          <PostComposer
            onCreatePost={createPost}
          />

          {loading ? (
            <FeedLoadingSkeleton />
          ) : feedError ? (
            <FeedErrorState
              onRetry={retryFeed}
            />
          ) : posts.length === 0 ? (
            <FeedEmptyState />
          ) : (
            <div className="space-y-7">
              {posts.map((post) => (
                <FeedPostCard
                  key={post._id}
                  post={post}
                  likePost={likePost}
                  commentText={commentText}
                  setCommentText={setCommentText}
                  addComment={addComment}
                  onDeletePost={deletePost}
                />
              ))}
            </div>
          )}
        </main>

        <aside className="hidden xl:col-span-4 xl:block">
          <div className="sticky top-24">
            <FeedRightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Feed;