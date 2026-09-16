import {
  Activity,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  GitBranch,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

function WorkspaceHeader({
  project,
  tasks = [],
  onCreateTask,
  onInvite,
  onRepository,
  onShare,
  onOpenAI,
  onEditProject,
  onDelete,
  deleting,
  onRefresh,
  refreshing,
}) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const inProgress = tasks.filter((task) => task.status === "in-progress").length;
  const completion = total ? Math.round((completed / total) * 100) : 0;
  const updated = project.updatedAt ? new Date(project.updatedAt) : null;

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#111827] shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(34,211,238,.14),transparent_32%),radial-gradient(circle_at_90%_0%,rgba(59,130,246,.12),transparent_28%)]" />

      <div className="relative p-6 sm:p-8 xl:p-9">
        <div className="flex flex-col gap-8 xl:flex-row xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-start gap-5">
              <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 shadow-[0_18px_50px_rgba(34,211,238,.18)] sm:flex">
                <FolderKanban size={28} className="text-slate-950" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.16em] text-cyan-300">
                    Project workspace
                  </span>
                  {project.status && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {project.status.replace("-", " ")}
                    </span>
                  )}
                </div>

                <h1 className="mt-3 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl xl:text-4xl">
                  {project.title || "Untitled project"}
                </h1>

                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400 sm:text-[15px]">
                  {project.description || "No project description has been added yet."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-slate-500 sm:text-sm">
                  <span className="flex items-center gap-2"><Users size={15} /> {project.members?.length || 0} members</span>
                  <span className="flex items-center gap-2"><CalendarDays size={15} /> {updated && !Number.isNaN(updated.getTime()) ? `Updated ${updated.toLocaleDateString()}` : "No update date"}</span>
                  <span className="flex items-center gap-2 text-emerald-400"><CheckCircle2 size={15} /> {completed} completed</span>
                  <span className="flex items-center gap-2 text-amber-300"><Activity size={15} /> {inProgress} in progress</span>
                </div>

                <div className="mt-7 max-w-3xl">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-400"><Target size={14} className="text-cyan-400" /> Delivery progress</span>
                    <span className="font-semibold text-cyan-300">{completion}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" style={{ width: `${completion}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 xl:max-w-[280px]">
            <button onClick={onCreateTask} className="flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300">
              <Plus size={18} /> Create task
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={onOpenAI} className="flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/15">
                <Sparkles size={16} /> AI
              </button>
              <button onClick={onInvite} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10">
                <Users size={16} /> Invite
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={onRepository} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10">
                <GitBranch size={16} /> Repo
              </button>
              <button onClick={onShare} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10">
                <Share2 size={16} /> Share
              </button>
            </div>

            <div className="flex gap-3">
              {onEditProject && (
                <button onClick={onEditProject} className="flex-1 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm text-slate-300 hover:bg-white/5">
                  Edit project
                </button>
              )}
              <button onClick={onRefresh} disabled={refreshing} title="Refresh workspace" className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-slate-400 hover:bg-white/5 disabled:opacity-50">
                <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>

            {onDelete && (
              <button onClick={onDelete} disabled={deleting} className="rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-2.5 text-xs font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50">
                {deleting ? "Deleting project…" : "Delete project"}
              </button>
            )}

            <div className="rounded-xl border border-white/10 bg-black/10 p-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Current sprint</span>
                <MoreHorizontal size={15} />
              </div>
              <p className="mt-2 text-sm font-medium text-white">{completed} of {total} tasks complete</p>
              <p className="mt-1 text-xs text-slate-500">{total - completed} remaining in the current board.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkspaceHeader;
