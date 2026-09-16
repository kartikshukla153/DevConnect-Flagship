import { AlertTriangle, CheckCircle2, Clock3, ClipboardList, Users } from "lucide-react";

function Metric({ title, value, note, icon: Icon, tone = "cyan", progress }) {
  const tones = {
    cyan: "border-cyan-500/15 bg-cyan-500/5 text-cyan-300",
    green: "border-emerald-500/15 bg-emerald-500/5 text-emerald-300",
    amber: "border-amber-500/15 bg-amber-500/5 text-amber-300",
    red: "border-red-500/15 bg-red-500/5 text-red-300",
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[.14em] text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{note}</p>
        </div>
        <div className={`rounded-xl border p-2.5 ${tones[tone]}`}><Icon size={18} /></div>
      </div>
      {progress !== undefined && (
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      )}
    </div>
  );
}

function WorkspaceStats({ tasks = [], project = {} }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const overdue = tasks.filter((t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "completed").length;
  const unassigned = tasks.filter((t) => !t.assignedTo).length;
  const completion = total ? Math.round((completed / total) * 100) : 0;
  const wipRate = total ? Math.round(((inProgress + review) / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total tasks" value={total} note="Tracked on this workspace" icon={ClipboardList} progress={total ? 100 : 0} />
        <Metric title="Completed" value={completed} note={`${completion}% completion rate`} icon={CheckCircle2} tone="green" progress={completion} />
        <Metric title="Work in progress" value={inProgress + review} note={`${wipRate}% currently active`} icon={Clock3} tone="amber" progress={wipRate} />
        <Metric title="Overdue" value={overdue} note={`${unassigned} unassigned`} icon={AlertTriangle} tone="red" progress={total ? Math.round((overdue / total) * 100) : 0} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="xl:col-span-2 rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-400">Delivery signal</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Execution at a glance</h2>
            </div>
            <div className="text-left sm:text-right"><p className="text-2xl font-bold text-white">{completion}%</p><p className="text-xs text-slate-500">completed</p></div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${completion}%` }} />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {[['Todo', tasks.filter((t) => t.status === 'todo').length], ['Active', inProgress], ['Review', review], ['Done', completed]].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/5 bg-[#0B1220] p-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#111827] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-cyan-400">Team</p><h2 className="mt-1 text-xl font-semibold text-white">Capacity</h2></div>
            <Users size={20} className="text-cyan-400" />
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#0B1220] p-4"><p className="text-xs text-slate-500">Members</p><p className="mt-1 text-2xl font-bold text-white">{project.members?.length || 0}</p></div>
            <div className="rounded-xl bg-[#0B1220] p-4"><p className="text-xs text-slate-500">Unassigned</p><p className="mt-1 text-2xl font-bold text-white">{unassigned}</p></div>
          </div>
          <p className="mt-5 text-xs leading-5 text-slate-500">Metrics are derived directly from the tasks currently loaded for this project; no synthetic productivity score is used.</p>
        </section>
      </div>
    </div>
  );
}

export default WorkspaceStats;
