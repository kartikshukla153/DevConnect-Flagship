import { CheckCircle2, Circle, Clock3, ListChecks } from "lucide-react";

export default function Timeline({ milestones = [] }) {
  if (!milestones.length) {
    return (
      <section className="rounded-xl border border-dashed border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white">Delivery roadmap</h2>
        <p className="mt-2 text-xs text-slate-500">Milestones will appear here when the project roadmap is available.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-400">Plan and delivery</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Project milestones</h2>
        </div>
        <p className="text-xs text-slate-500">{milestones.length} delivery phases</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {milestones.map((milestone, index) => {
          const tasks = Array.isArray(milestone.tasks) ? milestone.tasks : [];
          const completed = tasks.filter((task) => task.status === "completed").length;
          const inProgress = tasks.filter((task) => task.status === "in-progress").length;
          const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
          const isComplete = tasks.length > 0 && progress === 100;
          const Icon = isComplete ? CheckCircle2 : inProgress ? Clock3 : Circle;

          return (
            <article key={`${milestone.title}-${index}`} className="rounded-xl border border-white/[0.07] bg-[#0E1725] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isComplete ? "bg-emerald-400/10 text-emerald-300" : inProgress ? "bg-blue-400/10 text-blue-300" : "bg-white/[0.05] text-slate-500"
                  }`}>
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Phase {String(index + 1).padStart(2, "0")}</p>
                    <h3 className="mt-1 text-sm font-semibold text-slate-100">{milestone.title}</h3>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold tabular-nums text-slate-300">{progress}%</span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className={`h-full rounded-full transition-all duration-300 ${isComplete ? "bg-emerald-400" : "bg-cyan-400"}`} style={{ width: `${progress}%` }} />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                <span className="inline-flex items-center gap-1.5"><ListChecks size={12} /> {completed}/{tasks.length} tasks complete</span>
                {inProgress > 0 && <span>{inProgress} active</span>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
