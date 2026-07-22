import {
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  ArrowUpRight,
} from "lucide-react";

const priorityColors = {
  High: {
    badge:
      "border-red-500/20 bg-red-500/10 text-red-400",
    progress: "bg-red-500",
  },
  Medium: {
    badge:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
    progress: "bg-amber-500",
  },
  Low: {
    badge:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    progress: "bg-emerald-500",
  },
};

function MyTasks({ tasks = [] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          My Sprint
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Keep track of your assigned work and upcoming deadlines.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0B1220]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle2
              size={30}
              className="text-emerald-400"
            />
          </div>

          <h3 className="mt-6 text-xl font-semibold text-white">
            Sprint Complete 🎉
          </h3>

          <p className="mt-3 max-w-sm text-center text-sm leading-7 text-slate-400">
            You're all caught up. New assigned tasks will
            appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {tasks.map((task) => {
            const colors =
              priorityColors[task.priority] ||
              priorityColors.Medium;

            return (
              <div
                key={task._id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_16px_45px_rgba(34,211,238,0.08)]"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        {task.completed ? (
                          <CheckCircle2
                            size={22}
                            className="text-emerald-400"
                          />
                        ) : (
                          <Circle
                            size={22}
                            className="text-slate-500"
                          />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">
                            {task.title}
                          </h3>

                          {task.completed && (
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                              Done
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm leading-7 text-slate-400">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-slate-500 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-400"
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${colors.badge}`}
                    >
                      <Flag size={12} />
                      {task.priority || "Medium"}
                    </span>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 size={15} />

                      <span>
                        Due{" "}
                        {task.dueDate
                          ? new Date(
                              task.dueDate
                            ).toLocaleDateString()
                          : "No deadline"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                      <span>Progress</span>

                      <span>
                        {task.completed ? "100%" : "65%"}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full ${colors.progress}`}
                        style={{
                          width: task.completed
                            ? "100%"
                            : "65%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyTasks;