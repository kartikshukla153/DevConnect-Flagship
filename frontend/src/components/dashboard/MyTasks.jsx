import {
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  ArrowUpRight,
  ListTodo,
} from "lucide-react";

const priorityColors = {
  High: {
    badge: "border-red-400/15 bg-red-400/[0.07] text-red-400",
    progress: "bg-red-400",
  },
  Medium: {
    badge: "border-amber-400/15 bg-amber-400/[0.07] text-amber-400",
    progress: "bg-amber-400",
  },
  Low: {
    badge: "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400",
    progress: "bg-emerald-400",
  },
};

function MyTasks({ tasks = [] }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111827] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.14)] sm:p-8">
      <div className="mb-7">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />

          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            My Sprint
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Your assigned work, priorities and upcoming deadlines.
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] px-5 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.07]">
            <ListTodo
              size={26}
              className="text-emerald-400"
            />
          </div>

          <h3 className="mt-5 text-lg font-bold text-white">
            Your sprint is clear
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Assigned tasks will automatically appear here when
            you start collaborating inside a project.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const colors =
              priorityColors[task.priority] ||
              priorityColors.Medium;

            const progress = task.completed ? 100 : 0;

            return (
              <div
                key={task._id}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1220] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20"
              >
                <div className="relative">
                  <div className="flex items-start gap-3">
                    {task.completed ? (
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />
                    ) : (
                      <Circle
                        size={20}
                        className="mt-0.5 shrink-0 text-slate-600"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className={`font-semibold ${
                            task.completed
                              ? "text-slate-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {task.title}
                        </h3>

                        <ArrowUpRight
                          size={16}
                          className="shrink-0 text-slate-700 transition-colors group-hover:text-cyan-400"
                        />
                      </div>

                      {task.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}
                        >
                          <Flag size={11} />
                          {task.priority || "Medium"}
                        </span>

                        <span className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Clock3 size={13} />

                          {task.dueDate
                            ? new Date(
                                task.dueDate
                              ).toLocaleDateString()
                            : "No deadline"}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-[10px] font-medium text-slate-600">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${colors.progress}`}
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>
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