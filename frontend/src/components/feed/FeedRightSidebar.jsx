import { ArrowUpRight, FolderKanban, Hash, Sparkles } from "lucide-react";

function normalizeTags(posts) {
  const counts = new Map();
  for (const post of posts || []) {
    const text = String(post?.content || "");
    const tags = text.match(/#[A-Za-z0-9_.-]+/g) || [];
    for (const tag of tags) {
      const key = tag.toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

function idOf(value) {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return String(value?._id || value?.id || value?.userId || "");
}

export default function FeedRightSidebar({ posts = [], projects = [] }) {
  const trends = normalizeTags(posts);
  const activeProjects = (projects || []).filter((project) => !["completed", "archived", "closed"].includes(String(project?.status || "active").toLowerCase())).slice(0, 4);

  return (
    <aside className="space-y-3 xl:sticky xl:top-20">
      <section className="overflow-hidden rounded-2xl border border-white/[0.065] bg-[#0F172A]">
        <div className="flex items-center gap-3 border-b border-white/[0.055] px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10"><Hash size={15} className="text-cyan-300" /></div>
          <div><h2 className="text-xs font-bold text-white">Trending technologies</h2><p className="mt-0.5 text-[9px] text-slate-600">Derived from real feed posts</p></div>
        </div>
        <div className="p-3">
          {trends.length ? <div className="space-y-1">{trends.map(([tag, count]) => <div key={tag} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/[0.025]"><span className="text-xs font-semibold text-slate-300">{tag}</span><span className="text-[10px] text-slate-600">{count} {count === 1 ? "post" : "posts"}</span></div>)}</div> : <div className="rounded-xl border border-dashed border-white/[0.07] px-4 py-7 text-center"><Hash size={18} className="mx-auto text-slate-700" /><p className="mt-2 text-[11px] font-medium text-slate-500">No technology trends yet.</p><p className="mt-1 text-[9px] leading-4 text-slate-700">Use hashtags such as #React or #NodeJS in posts to build the live trend data.</p></div>}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.065] bg-[#0F172A]">
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.055] px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10"><FolderKanban size={15} className="text-cyan-300" /></div><div><h2 className="text-xs font-bold text-white">Active projects</h2><p className="mt-0.5 text-[9px] text-slate-600">From your workspace</p></div></div>{activeProjects.length ? <span className="text-[9px] font-semibold text-slate-600">{activeProjects.length} shown</span> : null}</div>
        <div className="p-3">
          {activeProjects.length ? <div className="space-y-1">{activeProjects.map((project) => <button key={idOf(project)} type="button" onClick={() => { const id = idOf(project); if (id) window.location.href = `/workspace/${id}`; }} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.025]"><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-300 group-hover:text-white">{project?.title || project?.name || "Untitled project"}</p><p className="mt-0.5 truncate text-[9px] text-slate-700">{project?.description || "Workspace project"}</p></div><ArrowUpRight size={13} className="text-slate-700 group-hover:text-cyan-300" /></button>)}</div> : <div className="rounded-xl border border-dashed border-white/[0.07] px-4 py-7 text-center"><FolderKanban size={18} className="mx-auto text-slate-700" /><p className="mt-2 text-[11px] font-medium text-slate-500">No active projects.</p><p className="mt-1 text-[9px] leading-4 text-slate-700">Your real workspace projects will appear here.</p></div>}
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.07] to-transparent p-4">
        <div className="flex items-center gap-2 text-cyan-300"><Sparkles size={14} /><span className="text-[10px] font-bold uppercase tracking-[0.16em]">Build in public</span></div>
        <p className="mt-2 text-[11px] leading-5 text-slate-500">Share what you are building, document engineering decisions, and collaborate with developers through the network.</p>
      </section>
    </aside>
  );
}
