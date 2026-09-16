import { useCallback, useEffect, useMemo, useState } from "react";

import { AlertCircle, RefreshCw, Rss } from "lucide-react";

import PostComposer from "../components/feed/PostComposer";
import FeedPostCard from "../components/feed/FeedPostCard";
import FeedStats from "../components/feed/FeedStats";
import FeedRightSidebar from "../components/feed/FeedRightSidebar";

/* =========================================================
   API CONFIG
========================================================= */

function getApiBase() {
  const configured =
    import.meta.env.VITE_API_URL?.trim() ||
    "http://localhost:5000/api";

  const clean = configured.replace(/\/+$/, "");

  return clean.endsWith("/api") ? clean : `${clean}/api`;
}

const API_BASE = getApiBase();

/* =========================================================
   AUTH HELPERS
========================================================= */

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

/* =========================================================
   RESPONSE HELPERS
========================================================= */

function arr(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of [
    ...keys,
    "posts",
    "projects",
    "conversations",
    "notifications",
    "tasks",
    "data",
    "items",
    "results",
    "records",
  ]) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (payload?.data && typeof payload.data === "object") {
    return arr(payload.data, keys);
  }

  return [];
}

function getEntityId(entity) {
  return entity?._id || entity?.id || null;
}

/* =========================================================
   PROJECT ACCESS
   ---------------------------------------------------------
   Feed must never bypass project authorization.

   The task endpoint is protected by project membership.
   Therefore we only request task data for projects that
   the authenticated user can legitimately access.

   Supported project member shapes:
   - members: [{ user: ObjectId }]
   - members: [{ user: { _id } }]
   - members: [{ user: { id } }]
   - members: [ObjectId]
========================================================= */

function userBelongsToProject(project, userId) {
  if (!project || !userId) {
    return false;
  }

  const normalizedUserId = String(userId);

  const creatorId =
    project?.creator?._id ||
    project?.creator?.id ||
    project?.creator;

  if (
    creatorId &&
    String(creatorId) === normalizedUserId
  ) {
    return true;
  }

  if (!Array.isArray(project?.members)) {
    return false;
  }

  return project.members.some((member) => {
    const memberUserId =
      member?.user?._id ||
      member?.user?.id ||
      member?.user ||
      member?._id ||
      member?.id ||
      member;

    return (
      memberUserId &&
      String(memberUserId) === normalizedUserId
    );
  });
}

/* =========================================================
   BOUNDED CONCURRENCY
   ---------------------------------------------------------
   Avoid firing 20 task requests simultaneously.

   This keeps the Feed lightweight and prevents a large
   project list from becoming a request fan-out problem.
========================================================= */

async function mapWithConcurrency(
  items,
  worker,
  concurrency = 4
) {
  if (!items.length) {
    return [];
  }

  const results = new Array(items.length);
  let cursor = 0;

  async function runWorker() {
    while (true) {
      const index = cursor++;

      if (index >= items.length) {
        return;
      }

      try {
        results[index] = await worker(items[index], index);
      } catch {
        results[index] = [];
      }
    }
  }

  const workerCount = Math.min(
    Math.max(1, concurrency),
    items.length
  );

  await Promise.all(
    Array.from(
      { length: workerCount },
      () => runWorker()
    )
  );

  return results;
}

/* =========================================================
   API
========================================================= */

async function api(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",

      ...(options.body instanceof FormData
        ? {}
        : {
            "Content-Type": "application/json",
          }),

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        payload?.error ||
        text ||
        `Request failed with status ${response.status}`
    );
  }

  return payload;
}

/* =========================================================
   FEED
========================================================= */

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [commentText, setCommentText] = useState({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const user = getUser();

  /* =======================================================
     LOAD FEED
  ======================================================= */

  const loadFeed = useCallback(
    async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        /*
         * Independent feed services intentionally use
         * Promise.allSettled so one unavailable service
         * does not destroy the entire Feed.
         */
        const [
          postResult,
          projectResult,
          conversationResult,
          notificationResult,
        ] = await Promise.allSettled([
          api("/posts"),
          api("/projects"),
          api("/conversations"),
          api("/notifications"),
        ]);

        /* ---------------------------------------------------
           Posts
        --------------------------------------------------- */

        if (postResult.status === "fulfilled") {
          setPosts(
            arr(postResult.value, ["posts"])
          );
        }

        /* ---------------------------------------------------
           Projects
        --------------------------------------------------- */

        if (projectResult.status === "fulfilled") {
          setProjects(
            arr(projectResult.value, ["projects"])
          );
        }

        /* ---------------------------------------------------
           Conversations
        --------------------------------------------------- */

        if (
          conversationResult.status ===
          "fulfilled"
        ) {
          setConversations(
            arr(
              conversationResult.value,
              ["conversations"]
            )
          );
        }

        /* ---------------------------------------------------
           Notifications
        --------------------------------------------------- */

        if (
          notificationResult.status ===
          "fulfilled"
        ) {
          setNotifications(
            arr(
              notificationResult.value,
              ["notifications"]
            )
          );
        }

        /* ===================================================
           PROJECT TASK DATA

           IMPORTANT:

           /tasks/project/:projectId is protected by
           project membership authorization.

           /projects may return discoverable projects that
           the current user is NOT a member of.

           Therefore Feed must filter projects before making
           task requests.

           This prevents:
             - unnecessary 403s
             - noisy browser console errors
             - wasted API calls
             - authorization-boundary violations
             - request fan-out across unrelated projects
        =================================================== */

        const loadedProjects =
          projectResult.status === "fulfilled"
            ? arr(
                projectResult.value,
                ["projects"]
              )
            : [];

        const userId =
          user?._id || user?.id || null;

        const accessibleProjects =
          loadedProjects
            .filter((project) =>
              userBelongsToProject(
                project,
                userId
              )
            )
            .slice(0, 20);

        /*
         * Only authorized projects reach this endpoint.
         *
         * Requests are bounded to four concurrent calls
         * rather than creating a burst of 20 requests.
         */
        const taskSets =
          await mapWithConcurrency(
            accessibleProjects,
            async (project) => {
              const id = getEntityId(project);

              if (!id) {
                return [];
              }

              const payload = await api(
                `/tasks/project/${id}`
              );

              return arr(payload, ["tasks"]);
            },
            4
          );

        /*
         * Deduplicate tasks defensively.

         * A task should normally belong to one project and
         * therefore appear once, but this protects the Feed
         * against duplicate payloads or future aggregation
         * changes.
         */
        const uniqueTasks = [
          ...new Map(
            taskSets
              .flat()
              .map((task) => [
                String(
                  task?._id ||
                    task?.id ||
                    `${task?.project}-${task?.title}`
                ),
                task,
              ])
          ).values(),
        ].filter(
          (task) =>
            task &&
            (task._id || task.id)
        );

        setTasks(uniqueTasks);

        /* ---------------------------------------------------
           Partial service failure handling
        --------------------------------------------------- */

        const failures = [
          postResult,
          projectResult,
          conversationResult,
          notificationResult,
        ].filter(
          (result) =>
            result.status === "rejected"
        ).length;

        if (failures) {
          setError(
            `${failures} feed service${
              failures > 1 ? "s" : ""
            } could not be reached. Showing available data.`
          );
        }
      } catch (err) {
        setError(
          err?.message ||
            "Feed data could not be loaded."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?._id, user?.id]
  );

  useEffect(() => {
    loadFeed(false);
  }, [loadFeed]);

  /* =======================================================
     CREATE POST
  ======================================================= */

  async function createPost(formData) {
    setCreating(true);

    try {
      const payload = await api("/posts", {
        method: "POST",
        body: formData,
      });

      const created =
        payload?.post ||
        payload?.data?.post ||
        payload?.data ||
        null;

      if (created) {
        setPosts((previous) => [
          created,
          ...previous,
        ]);
      } else {
        await loadFeed(true);
      }
    } finally {
      setCreating(false);
    }
  }

  /* =======================================================
     LIKE POST
  ======================================================= */

  async function likePost(postId) {
    const index = posts.findIndex(
      (post) =>
        String(
          post?._id || post?.id
        ) === String(postId)
    );

    if (index < 0) {
      return;
    }

    const before = posts[index];

    const userId =
      user?._id || user?.id;

    const likes = Array.isArray(
      before.likes
    )
      ? before.likes
      : [];

    const liked = likes.some(
      (like) =>
        String(
          like?._id ||
            like?.id ||
            like
        ) === String(userId)
    );

    /*
     * Optimistic UI update.
     */
    setPosts((previous) =>
      previous.map((post, i) =>
        i === index
          ? {
              ...post,
              likes: liked
                ? likes.filter(
                    (like) =>
                      String(
                        like?._id ||
                          like?.id ||
                          like
                      ) !==
                      String(userId)
                  )
                : [
                    ...likes,
                    userId,
                  ],
            }
          : post
      )
    );

    try {
      await api(
        `/posts/${postId}/like`,
        {
          method: "PUT",
        }
      );
    } catch (err) {
      /*
       * Roll back optimistic update if
       * the server rejects the operation.
       */
      setPosts((previous) =>
        previous.map((post, i) =>
          i === index
            ? before
            : post
        )
      );

      setError(
        err?.message ||
          "Unable to update like."
      );
    }
  }

  /* =======================================================
     ADD COMMENT
  ======================================================= */

  async function addComment(postId) {
    const text =
      commentText[postId]?.trim();

    if (!text) {
      return;
    }

    const before = posts;

    setCommentText((previous) => ({
      ...previous,
      [postId]: "",
    }));

    try {
      const payload = await api(
        `/posts/${postId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            text,
          }),
        }
      );

      const updated =
        payload?.post ||
        payload?.data?.post ||
        payload?.data;

      if (updated) {
        setPosts((previous) =>
          previous.map((post) =>
            String(
              post._id || post.id
            ) === String(postId)
              ? updated
              : post
          )
        );
      } else {
        await loadFeed(true);
      }
    } catch (err) {
      setPosts(before);

      setCommentText((previous) => ({
        ...previous,
        [postId]: text,
      }));

      setError(
        err?.message ||
          "Unable to add comment."
      );
    }
  }

  /* =======================================================
     DELETE POST
  ======================================================= */

  async function deletePost(postId) {
    await api(`/posts/${postId}`, {
      method: "DELETE",
    });

    setPosts((previous) =>
      previous.filter(
        (post) =>
          String(
            post?._id || post?.id
          ) !== String(postId)
      )
    );
  }

  /* =======================================================
     FEED STATS
  ======================================================= */

  const stats = useMemo(
    () => ({
      projects: projects.length,

      completedTasks:
        tasks.filter(
          (task) =>
            task?.completed ||
            [
              "done",
              "completed",
            ].includes(
              String(
                task?.status || ""
              ).toLowerCase()
            )
        ).length,

      conversations:
        conversations.length,

      unreadNotifications:
        notifications.filter(
          (item) =>
            item?.read === false ||
            item?.isRead === false ||
            (item?.readAt == null &&
              item?.read !== true &&
              item?.isRead !== true)
        ).length,
    }),
    [
      projects,
      tasks,
      conversations,
      notifications,
    ]
  );

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-4 pb-10">
        <div className="h-20 animate-pulse rounded-2xl bg-[#0F172A]" />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((x) => (
            <div
              key={x}
              className="h-28 animate-pulse rounded-2xl bg-[#0F172A]"
            />
          ))}
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 space-y-4 xl:col-span-8">
            <div className="h-52 animate-pulse rounded-2xl bg-[#0F172A]" />
            <div className="h-80 animate-pulse rounded-2xl bg-[#0F172A]" />
          </div>

          <div className="col-span-12 space-y-4 xl:col-span-4">
            <div className="h-56 animate-pulse rounded-2xl bg-[#0F172A]" />
            <div className="h-56 animate-pulse rounded-2xl bg-[#0F172A]" />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="space-y-4 pb-10">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Developer network
          </div>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-[28px]">
            Developer Feed
          </h1>

          <p className="mt-1 text-[11px] text-slate-600">
            Follow what developers are building,
            learning, and shipping.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadFeed(true)
          }
          disabled={refreshing}
          className="inline-flex h-9 w-fit items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 text-[10px] font-semibold text-slate-500 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing"
            : "Refresh"}
        </button>
      </header>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] px-3.5 py-2.5 text-[10px] text-amber-200/70">
          <AlertCircle
            size={14}
            className="mt-0.5 shrink-0"
          />

          <span>{error}</span>
        </div>
      ) : null}

      <FeedStats {...stats} />

      <div className="grid grid-cols-12 items-start gap-4">
        <main className="col-span-12 space-y-4 xl:col-span-8">
          <PostComposer
            onCreatePost={createPost}
            creating={creating}
          />

          {posts.length ? (
            posts.map((post) => (
              <FeedPostCard
                key={
                  post?._id ||
                  post?.id
                }
                post={post}
                likePost={likePost}
                commentText={commentText}
                setCommentText={
                  setCommentText
                }
                addComment={
                  addComment
                }
                onDeletePost={
                  deletePost
                }
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/[0.07] bg-[#0F172A] px-6 py-16 text-center">
              <Rss
                size={24}
                className="mx-auto text-slate-700"
              />

              <h2 className="mt-3 text-sm font-bold text-slate-400">
                Your developer network
                is quiet.
              </h2>

              <p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-slate-700">
                Be the first to share
                what you are building,
                learning, or shipping.
              </p>
            </div>
          )}
        </main>

        <div className="col-span-12 xl:col-span-4">
          <FeedRightSidebar
            posts={posts}
            projects={projects}
          />
        </div>
      </div>
    </div>
  );
}