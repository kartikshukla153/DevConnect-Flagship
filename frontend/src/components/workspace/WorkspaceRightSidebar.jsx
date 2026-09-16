import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, CircleDot, GitBranch, Sparkles, Users } from "lucide-react";

function WorkspaceRightSidebar({ project, tasks = [], onCreateTask, onInvite, onRepository, onOpenAI }) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const active = tasks.filter((t) => t.status === "in-progress").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const overdue = tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed").length;
  const completion = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const upcoming = [...tasks].filter((t) => t.deadline && t.status !== "completed").sort((a,b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 4);

  const health = overdue > 0 ? { label: "Needs attention", tone: "text-amber-300", detail: `${overdue} overdue task${overdue === 1 ? "" : "s"} need attention.` } : review > 0 ? { label: "In review", tone: "text-violet-300", detail: `${review} task${review === 1 ? " is" : "s are"} waiting for review.` } : active > 0 ? { label: "Work moving", tone: "text-cyan-300", detail: `${active} active task${active === 1 ? " is" : "s are"} currently in progress.` } : { label: "No active work", tone: "text-slate-400", detail: "No task is currently marked in progress." };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-400">Delivery</p><h2 className="mt-1 text-lg font-semibold text-white">Sprint snapshot</h2></div><CircleDot size={19} className="text-cyan-400" /></div>
        <div className="mt-6 flex items-end justify-between"><div><p className="text-3xl font-bold text-white">{completion}%</p><p className="mt-1 text-xs text-slate-500">completed</p></div><div className="text-right text-xs text-slate-500"><p>{completed} done</p><p>{tasks.length - completed} remaining</p></div></div>
        <div className="mt-4 h-2 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${completion}%` }} /></div>
        <div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-[#0B1220] p-3"><p className="text-[10px] text-slate-600">Active</p><p className="mt-1 font-semibold text-white">{active}</p></div><div className="rounded-xl bg-[#0B1220] p-3"><p className="text-[10px] text-slate-600">Review</p><p className="mt-1 font-semibold text-white">{review}</p></div><div className="rounded-xl bg-[#0B1220] p-3"><p className="text-[10px] text-slate-600">Overdue</p><p className="mt-1 font-semibold text-white">{overdue}</p></div></div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-400">Health</p><h2 className={`mt-1 text-lg font-semibold ${health.tone}`}>{health.label}</h2></div><AlertTriangle size={18} className={overdue ? "text-amber-300" : "text-slate-600"} /></div>
        <p className="mt-3 text-xs leading-5 text-slate-500">{health.detail}</p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Users size={14} /> {project.members?.length || 0} project members</div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#111827] p-5">
        <div className="flex items-center gap-2"><CalendarClock size={17} className="text-cyan-400" /><h2 className="text-sm font-semibold text-white">Upcoming deadlines</h2></div>
        <div className="mt-4 space-y-2">
          {upcoming.map((task) => <div key={task._id} className="rounded-xl border border-white/5 bg-[#0B1220] p-3"><p className="line-clamp-1 text-xs font-medium text-slate-300">{task.title}</p><p className="mt-1 text-[10px] text-slate-600">{new Date(task.deadline).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</p></div>)}
          {upcoming.length === 0 && <p className="rounded-xl bg-[#0B1220] p-4 text-xs text-slate-600">No upcoming deadlines.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-5">
        <div className="flex items-center gap-2"><Sparkles size={17} className="text-cyan-300" /><h2 className="text-sm font-semibold text-cyan-100">Engineering assistant</h2></div>
        <p className="mt-2 text-xs leading-5 text-slate-500">Use the actual task and repository context to inspect delivery risk, summarize work, or plan the next step.</p>
        <button onClick={onOpenAI} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/15 bg-cyan-500/10 px-3 py-2.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/15">Open AI workspace <ArrowRight size={14} /></button>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <button onClick={onCreateTask} className="rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-xs font-medium text-slate-300 hover:bg-white/5"><CheckCircle2 size={14} className="mx-auto mb-1.5 text-cyan-400" />New task</button>
        <button onClick={onInvite} className="rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-xs font-medium text-slate-300 hover:bg-white/5"><Users size={14} className="mx-auto mb-1.5 text-cyan-400" />Invite</button>
        <button onClick={onRepository} className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-3 py-3 text-xs font-medium text-slate-300 hover:bg-white/5"><GitBranch size={14} />Open repository</button>
      </section>
    </div>
  );
}

export default WorkspaceRightSidebar;
