import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Globe2,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trash2,
  X,
} from "lucide-react";

function idOf(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value?._id || value?.id || value?.userId || "");
}

function relativeTime(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
}

function getImageUrl(post) {
  return post?.imageUrl || post?.image?.url || post?.image?.secure_url || post?.media?.url || post?.attachment?.url || "";
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

export default function FeedPostCard({ post, likePost, commentText, setCommentText, addComment, onDeletePost }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageBroken, setImageBroken] = useState(false);
  const menuRef = useRef(null);

  const currentUser = getUser();
  const currentUserId = idOf(currentUser);
  const authorObject = post?.user || post?.author || {};
  const author = authorObject?.name || (typeof authorObject === "string" ? "Developer" : "Developer");
  const authorId = idOf(authorObject);
  const owner = Boolean(currentUserId && authorId && currentUserId === authorId);
  const imageUrl = getImageUrl(post);
  const likes = Array.isArray(post?.likes) ? post.likes : [];
  const comments = Array.isArray(post?.comments) ? post.comments : [];
  const liked = likes.some((like) => idOf(like) === currentUserId);
  const edited = Boolean(post?.updatedAt && post?.createdAt && new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime() > 1000);
  const visibility = String(post?.visibility || "public").toLowerCase() === "private" ? "Private" : "Public";
  const avatarUrl = authorObject?.profilePicture || authorObject?.avatar || "";

  const initials = useMemo(() => author.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "D", [author]);

  useEffect(() => {
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function copyPost() {
    try {
      const text = [post?.content || "", imageUrl].filter(Boolean).join("\n\n");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setMenuOpen(false);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      console.error("COPY POST ERROR:", error);
    }
  }

  async function confirmDelete() {
    if (!onDeletePost || deleting) return;
    try {
      setDeleting(true);
      await onDeletePost(post._id || post.id);
      setDeleteOpen(false);
      setMenuOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <article className={`overflow-hidden rounded-[22px] border border-white/[0.075] bg-[#0F172A] shadow-[0_12px_45px_rgba(0,0,0,.12)] transition duration-200 hover:border-white/[0.12] ${deleting ? "opacity-60" : ""}`}>
        <header className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-cyan-400/10">
              {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}
              <div className="absolute inset-0 -z-0 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-sky-500 text-sm font-black text-[#07131E]">{initials}</div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="truncate text-sm font-bold text-white">{author}</h3>
                <span className="rounded-full border border-cyan-400/15 bg-cyan-400/[0.07] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-cyan-300">Developer</span>
                {owner ? <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">You</span> : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                <Clock3 size={11} />
                <span>{relativeTime(post?.createdAt)}</span>
                <span>·</span>
                <Globe2 size={11} />
                <span>{visibility}</span>
                {edited ? <><span>·</span><span>Edited</span></> : null}
              </div>
            </div>
          </div>
          <div ref={menuRef} className="relative shrink-0">
            <button type="button" aria-label="Post options" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)} className={`rounded-xl p-2 transition ${menuOpen ? "bg-white/[0.06] text-white" : "text-slate-600 hover:bg-white/[0.04] hover:text-slate-300"}`}><MoreHorizontal size={18} /></button>
            {menuOpen ? (
              <div className="absolute right-0 top-10 z-40 w-44 overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111827] p-1.5 shadow-2xl">
                <button type="button" onClick={copyPost} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-slate-300 hover:bg-white/[0.05] hover:text-white"><Copy size={14} /> Copy post</button>
                {owner ? <button type="button" onClick={() => { setMenuOpen(false); setDeleteOpen(true); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-red-400 hover:bg-red-500/10"><Trash2 size={14} /> Delete post</button> : null}
              </div>
            ) : null}
          </div>
        </header>

        <div className="border-t border-white/[0.055] px-5 py-5 sm:px-6">
          {post?.content ? <p className="whitespace-pre-wrap break-words text-[14px] leading-7 text-slate-200">{post.content}</p> : null}
          {imageUrl && !imageBroken ? (
            <div className={`${post?.content ? "mt-4" : ""} overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0B1220]`}>
              <img src={imageUrl} alt="Post attachment" loading="lazy" className="block max-h-[620px] w-full object-contain" onError={() => setImageBroken(true)} />
            </div>
          ) : null}
          {imageUrl && imageBroken ? <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] px-3 py-2.5 text-[11px] text-amber-200/70"><ImageIcon size={13} /> Attachment unavailable.</div> : null}
          {!post?.content && !imageUrl ? <p className="text-sm text-slate-600">This post has no visible content.</p> : null}
        </div>

        <div className="flex items-center justify-between border-y border-white/[0.055] px-5 py-2.5 sm:px-6">
          <div className="flex items-center gap-4 text-[11px] text-slate-600">
            <span><strong className="text-slate-400">{likes.length}</strong> {likes.length === 1 ? "like" : "likes"}</span>
            <span><strong className="text-slate-400">{comments.length}</strong> {comments.length === 1 ? "comment" : "comments"}</span>
          </div>
          {copied ? <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300"><Check size={12} /> Copied</span> : <span className="text-[9px] uppercase tracking-[0.16em] text-slate-700">Developer discussion</span>}
        </div>

        <div className="grid grid-cols-2 gap-2 px-5 py-3 sm:px-6">
          <button type="button" onClick={() => likePost?.(post._id || post.id)} className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition ${liked ? "border-red-400/25 bg-red-400/[0.08] text-red-300" : "border-white/[0.06] bg-[#0B1220] text-slate-400 hover:border-red-400/20 hover:text-red-300"}`}><Heart size={15} fill={liked ? "currentColor" : "none"} />{liked ? "Liked" : "Like"}</button>
          <button type="button" onClick={() => document.getElementById(`comment-${post._id || post.id}`)?.focus()} className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-[#0B1220] text-xs font-semibold text-slate-400 transition hover:border-cyan-400/20 hover:text-cyan-300"><MessageCircle size={15} /> Comment</button>
        </div>

        {comments.length ? <div className="space-y-2 px-5 pb-3 sm:px-6">{comments.slice(-5).map((comment) => { const name = comment?.user?.name || "Developer"; return <div key={comment._id || `${comment.createdAt}-${name}`} className="rounded-xl border border-white/[0.055] bg-[#0B1220] px-3.5 py-3"><div className="flex items-center gap-2"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-[10px] font-bold text-cyan-300">{name.charAt(0).toUpperCase()}</div><div className="min-w-0"><div className="flex items-center gap-2"><span className="text-[11px] font-bold text-slate-300">{name}</span><span className="text-[10px] text-slate-700">{relativeTime(comment.createdAt)}</span></div><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-500">{comment.text}</p></div></div></div>; })}</div> : null}

        <div className="border-t border-white/[0.055] bg-[#0B1220]/35 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-[10px] font-black text-cyan-300">{String(currentUser?.name || "K").charAt(0).toUpperCase()}</div>
            <input id={`comment-${post._id || post.id}`} value={commentText?.[post._id || post.id] || ""} onChange={(e) => setCommentText?.((prev) => ({ ...prev, [post._id || post.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (commentText?.[post._id || post.id]?.trim()) addComment?.(post._id || post.id); } }} placeholder="Add to the discussion..." className="min-w-0 flex-1 rounded-xl border border-white/[0.06] bg-[#0F172A] px-3.5 py-2.5 text-xs text-white outline-none placeholder:text-slate-700 focus:border-cyan-400/25" />
            <button type="button" onClick={() => addComment?.(post._id || post.id)} disabled={!commentText?.[post._id || post.id]?.trim()} aria-label="Send comment" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-[#07131E] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-25"><Send size={15} /></button>
          </div>
        </div>
      </article>

      {deleteOpen ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"><div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111827] shadow-2xl"><div className="flex items-start gap-3 border-b border-white/[0.07] px-5 py-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10"><AlertTriangle size={18} className="text-red-400" /></div><div className="min-w-0 flex-1"><h3 className="font-bold text-white">Delete this post?</h3><p className="mt-1 text-xs leading-5 text-slate-500">This permanently removes the post and its comments.</p></div><button type="button" onClick={() => setDeleteOpen(false)} disabled={deleting} className="rounded-xl p-2 text-slate-600 hover:bg-white/[0.05] hover:text-white"><X size={17} /></button></div><div className="px-5 py-5"><div className="rounded-xl border border-white/[0.06] bg-[#0B1220] p-3 text-xs leading-5 text-slate-500 line-clamp-4">{post?.content || "Image post"}</div></div><div className="flex justify-end gap-2 border-t border-white/[0.07] px-5 py-4"><button type="button" onClick={() => setDeleteOpen(false)} disabled={deleting} className="rounded-xl border border-white/[0.07] px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/[0.04]">Cancel</button><button type="button" onClick={confirmDelete} disabled={deleting} className="flex min-w-[110px] items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-400 disabled:opacity-50">{deleting ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Trash2 size={14} />}{deleting ? "Deleting" : "Delete"}</button></div></div></div> : null}
    </>
  );
}
