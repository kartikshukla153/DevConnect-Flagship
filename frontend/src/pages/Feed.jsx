import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, RefreshCw, Rss } from "lucide-react";
import PostComposer from "../components/feed/PostComposer";
import FeedPostCard from "../components/feed/FeedPostCard";
import FeedStats from "../components/feed/FeedStats";
import FeedRightSidebar from "../components/feed/FeedRightSidebar";

function getApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000/api";
  const clean = configured.replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
}
const API_BASE = getApiBase();

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken") || "";
}
function getUser() { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }
function arr(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of [...keys, "posts", "data", "items", "results", "records"]) if (Array.isArray(payload?.[key])) return payload[key];
  if (payload?.data && typeof payload.data === "object") return arr(payload.data, keys);
  return [];
}
async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { Accept: "application/json", ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  const text = await response.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = {}; }
  if (!response.ok) throw new Error(payload?.message || payload?.error || text || `Request failed with status ${response.status}`);
  return payload;
}

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

  const loadFeed = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    setError("");
    try {
      const [postResult, projectResult, conversationResult, notificationResult] = await Promise.allSettled([
        api("/posts"),
        api("/projects"),
        api("/conversations"),
        api("/notifications"),
      ]);
      if (postResult.status === "fulfilled") setPosts(arr(postResult.value, ["posts"]));
      if (projectResult.status === "fulfilled") setProjects(arr(projectResult.value, ["projects"]));
      if (conversationResult.status === "fulfilled") setConversations(arr(conversationResult.value, ["conversations"]));
      if (notificationResult.status === "fulfilled") setNotifications(arr(notificationResult.value, ["notifications"]));

      const loadedProjects = projectResult.status === "fulfilled" ? arr(projectResult.value, ["projects"]) : [];
      const taskSets = await Promise.all(loadedProjects.slice(0, 20).map(async (project) => {
        const id = project?._id || project?.id;
        if (!id) return [];
        try { return arr(await api(`/tasks/project/${id}`), ["tasks"]); } catch { return []; }
      }));
      setTasks([...new Map(taskSets.flat().map((task) => [String(task?._id || task?.id), task])).values()].filter((task) => task && (task._id || task.id)));
      const failures = [postResult, projectResult, conversationResult, notificationResult].filter((r) => r.status === "rejected").length;
      if (failures) setError(`${failures} feed service${failures > 1 ? "s" : ""} could not be reached. Showing available data.`);
    } catch (err) {
      setError(err?.message || "Feed data could not be loaded.");
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadFeed(false); }, [loadFeed]);

  async function createPost(formData) {
    setCreating(true);
    try {
      const payload = await api("/posts", { method: "POST", body: formData });
      const created = payload?.post || payload?.data?.post || payload?.data || null;
      if (created) setPosts((previous) => [created, ...previous]); else await loadFeed(true);
    } finally { setCreating(false); }
  }

  async function likePost(postId) {
    const index = posts.findIndex((post) => String(post?._id || post?.id) === String(postId));
    if (index < 0) return;
    const before = posts[index];
    const userId = user?._id || user?.id;
    const likes = Array.isArray(before.likes) ? before.likes : [];
    const liked = likes.some((like) => String(like?._id || like?.id || like) === String(userId));
    setPosts((previous) => previous.map((post, i) => i === index ? { ...post, likes: liked ? likes.filter((like) => String(like?._id || like?.id || like) !== String(userId)) : [...likes, userId] } : post));
    try { await api(`/posts/${postId}/like`, { method: "PUT" }); } catch (err) { setPosts((previous) => previous.map((post, i) => i === index ? before : post)); setError(err?.message || "Unable to update like."); }
  }

  async function addComment(postId) {
    const text = commentText[postId]?.trim();
    if (!text) return;
    const before = posts;
    setCommentText((previous) => ({ ...previous, [postId]: "" }));
    try {
      const payload = await api(`/posts/${postId}/comments`, { method: "POST", body: JSON.stringify({ text }) });
      const updated = payload?.post || payload?.data?.post || payload?.data;
      if (updated) setPosts((previous) => previous.map((post) => String(post._id || post.id) === String(postId) ? updated : post));
      else await loadFeed(true);
    } catch (err) { setPosts(before); setCommentText((previous) => ({ ...previous, [postId]: text })); setError(err?.message || "Unable to add comment."); }
  }

  async function deletePost(postId) {
    await api(`/posts/${postId}`, { method: "DELETE" });
    setPosts((previous) => previous.filter((post) => String(post?._id || post?.id) !== String(postId)));
  }

  const stats = useMemo(() => ({
    projects: projects.length,
    completedTasks: tasks.filter((task) => task?.completed || ["done", "completed"].includes(String(task?.status || "").toLowerCase())).length,
    conversations: conversations.length,
    unreadNotifications: notifications.filter((item) => item?.read === false || item?.isRead === false || item?.readAt == null && item?.read !== true && item?.isRead !== true).length,
  }), [projects, tasks, conversations, notifications]);

  if (loading) return <div className="space-y-4 pb-10"><div className="h-20 animate-pulse rounded-2xl bg-[#0F172A]" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((x) => <div key={x} className="h-28 animate-pulse rounded-2xl bg-[#0F172A]" />)}</div><div className="grid grid-cols-12 gap-4"><div className="col-span-12 space-y-4 xl:col-span-8"><div className="h-52 animate-pulse rounded-2xl bg-[#0F172A]" /><div className="h-80 animate-pulse rounded-2xl bg-[#0F172A]" /></div><div className="col-span-12 space-y-4 xl:col-span-4"><div className="h-56 animate-pulse rounded-2xl bg-[#0F172A]" /><div className="h-56 animate-pulse rounded-2xl bg-[#0F172A]" /></div></div></div>;

  return (
    <div className="space-y-4 pb-10">
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300"><span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> Developer network</div><h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-[28px]">Developer Feed</h1><p className="mt-1 text-[11px] text-slate-600">Follow what developers are building, learning, and shipping.</p></div>
        <button type="button" onClick={() => loadFeed(true)} disabled={refreshing} className="inline-flex h-9 w-fit items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 text-[10px] font-semibold text-slate-500 hover:text-white disabled:opacity-50"><RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Refreshing" : "Refresh"}</button>
      </header>

      {error ? <div className="flex items-start gap-2 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] px-3.5 py-2.5 text-[10px] text-amber-200/70"><AlertCircle size={14} className="mt-0.5 shrink-0" /> <span>{error}</span></div> : null}

      <FeedStats {...stats} />

      <div className="grid grid-cols-12 items-start gap-4">
        <main className="col-span-12 space-y-4 xl:col-span-8">
          <PostComposer onCreatePost={createPost} creating={creating} />
          {posts.length ? posts.map((post) => <FeedPostCard key={post?._id || post?.id} post={post} likePost={likePost} commentText={commentText} setCommentText={setCommentText} addComment={addComment} onDeletePost={deletePost} />) : <div className="rounded-2xl border border-dashed border-white/[0.07] bg-[#0F172A] px-6 py-16 text-center"><Rss size={24} className="mx-auto text-slate-700" /><h2 className="mt-3 text-sm font-bold text-slate-400">Your developer network is quiet.</h2><p className="mx-auto mt-1 max-w-sm text-[11px] leading-5 text-slate-700">Be the first to share what you are building, learning, or shipping.</p></div>}
        </main>
        <div className="col-span-12 xl:col-span-4"><FeedRightSidebar posts={posts} projects={projects} /></div>
      </div>
    </div>
  );
}
