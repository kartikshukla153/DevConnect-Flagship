import {
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
  ListTodo,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const priorityConfig = {
  High: {
    badge:
      "border-red-400/15 bg-red-400/[0.07] text-red-400",
    progress: "bg-red-400",
  },

  Medium: {
    badge:
      "border-amber-400/15 bg-amber-400/[0.07] text-amber-400",
    progress: "bg-amber-400",
  },

  Low: {
    badge:
      "border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-400",
    progress: "bg-emerald-400",
  },
};

function MyTasks({ tasks = [] }) {
  const navigate = useNavigate();

  const getProgress = (task) => {
    if (task?.completed === true) {
      return 100;
    }

    const progress = Number(task?.progress);

    if (Number.isFinite(progress)) {
      return Math.min(Math.max(progress, 0), 100);
    }

    return null;
  };

  const getDueDate = (task) => {
    if (!task?.dueDate) {
      return "No deadline";
    }

    const date = new Date(task.dueDate);

    if (Number.isNaN(date.getTime())) {
      return "No deadline";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isOverdue = (task) => {
    if (!task?.dueDate || task?.completed) {
      return false;
    }

    const date = new Date(task.dueDate);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date.getTime() < Date.now();
  };

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111827] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.14)] sm:p-8">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]" />

            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              My Sprint
            </h2>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Your assigned work, priorities and deadlines from active
            projects.
          </p>
        </div>

        {tasks.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="hidden items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-cyan-400 sm:flex"
          >
            View projects
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {/* =========================================================
          EMPTY
      ========================================================= */}

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] bg-[#0B1220] px-5 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.06]">
            <ListTodo
              size={26}
              className="text-emerald-400"
            />
          </div>

          <h3 className="mt-5 text-lg font-bold text-white">
            Your sprint is clear
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
            Assigned tasks will appear here automatically when tasks
            are assigned to your account.
          </p>
        </div>
      ) : (
        /* =======================================================
           TASK LIST
        ======================================================= */

        <div className="space-y-4">
          {tasks.map((task, index) => {
            const priority =
              task?.priority || "Medium";

            const colors =
              priorityConfig[priority] ||
              priorityConfig.Medium;

            const progress = getProgress(task);
            const overdue = isOverdue(task);

            const taskId =
              task?._id ||
              task?.id ||
              `task-${index}`;

            return (
              <article
                key={taskId}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1220] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20"
              >
                <div className="relative">
                  <div className="flex items-start gap-3.5">
                    {/* STATUS */}

                    {task?.completed ? (
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
                      {/* TITLE */}

                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className={`font-semibold leading-6 ${
                            task?.completed
                              ? "text-slate-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {task?.title || "Untitled task"}
                        </h3>

                        <ArrowUpRight
                          size={16}
                          className="shrink-0 text-slate-700 transition-colors group-hover:text-cyan-400"
                        />
                      </div>

                      {/* DESCRIPTION */}

                      {task?.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-6 text-slate-500">
                          {task.description}
                        </p>
                      )}

                      {/* META */}

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${colors.badge}`}
                        >
                          <Flag size={11} />
                          {priority}
                        </span>

                        <span
                          className={`flex items-center gap-1.5 text-[11px] ${
                            overdue
                              ? "font-semibold text-red-400"
                              : "text-slate-600"
                          }`}
                        >
                          <Clock3 size={13} />

                          {overdue
                            ? `Overdue · ${getDueDate(task)}`
                            : getDueDate(task)}
                        </span>
                      </div>

                      {/* PROGRESS */}

                      {progress !== null && (
                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-[10px] font-medium">
                            <span className="text-slate-600">
                              Progress
                            </span>

                            <span className="text-slate-500">
                              {progress}%
                            </span>
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
                      )}

                      {progress === null && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-700">
                          <span className="h-px flex-1 bg-white/[0.05]" />
                          <span>
                            Progress tracking unavailable
                          </span>
                          <span className="h-px flex-1 bg-white/[0.05]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyTasks;