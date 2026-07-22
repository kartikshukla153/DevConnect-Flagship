import axios from "axios";
import TaskComments from "./TaskComments";

import {
  X,
  CalendarDays,
  User,
  Flag,
  Pencil,
  Trash2,
  Clock3,
  Sparkles,
  CheckCircle2,
  Tag,
} from "lucide-react";

const API = "http://localhost:5000/api";

function priorityColor(priority) {
  switch ((priority || "").toLowerCase()) {
    case "high":
      return "border-red-500/20 bg-red-500/10 text-red-400";

    case "medium":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

    case "low":
      return "border-green-500/20 bg-green-500/10 text-green-400";

    default:
      return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
  }
}

function TaskDetailsDrawer({
  open,
  task,
  onClose,
  reloadTasks,
}) {
  const token = localStorage.getItem("token");

  if (!task) return null;

  async function deleteTask() {
    if (!window.confirm("Delete this task?")) return;

    try {
      await axios.delete(
        `${API}/tasks/${task._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      reloadTasks();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  }

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-[560px] flex-col border-l border-white/10 bg-[#0F172A] shadow-[0_0_60px_rgba(0,0,0,.45)] transition-all duration-500 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* Header */}

        <div className="sticky top-0 z-20 border-b border-white/10 bg-[#111827]/95 px-8 py-6 backdrop-blur-xl">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Task Details
              </p>

              <h1 className="mt-3 text-3xl font-bold leading-tight text-white">
                {task.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-3">

                <span
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider ${priorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority || "Medium"}
                </span>

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  {task.status}
                </span>

              </div>

            </div>

            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-400 transition hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              <X size={20} />
            </button>

          </div>

        </div>

        {/* Scroll Area */}

        <div className="flex-1 space-y-8 overflow-y-auto p-8">

          {/* Meta Grid */}

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <User size={17} />
                <span className="text-xs uppercase tracking-widest">
                  Assignee
                </span>
              </div>

              <h3 className="font-semibold text-white">
                {task.assignedTo?.name || "Unassigned"}
              </h3>

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <CalendarDays size={17} />
                <span className="text-xs uppercase tracking-widest">
                  Deadline
                </span>
              </div>

              <h3 className="font-semibold text-white">
                {task.deadline
                  ? new Date(
                      task.deadline
                    ).toLocaleDateString()
                  : "No Deadline"}
              </h3>

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <Clock3 size={17} />
                <span className="text-xs uppercase tracking-widest">
                  Estimate
                </span>
              </div>

              <h3 className="font-semibold text-white">
                {task.estimate || "--"}
              </h3>

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">

              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <CheckCircle2 size={17} />
                <span className="text-xs uppercase tracking-widest">
                  Status
                </span>
              </div>

              <h3 className="font-semibold capitalize text-white">
                {task.status}
              </h3>

            </div>

          </div>
                    {/* Description */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <Tag size={20} />
              </div>

              <div>

                <h2 className="text-lg font-semibold text-white">
                  Description
                </h2>

                <p className="text-sm text-slate-500">
                  Task overview & implementation details
                </p>

              </div>

            </div>

            <p className="whitespace-pre-wrap leading-8 text-slate-300">

              {task.description || "No description has been added for this task."}

            </p>

          </section>

          {/* Labels */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">

            <h2 className="mb-5 text-lg font-semibold text-white">
              Labels
            </h2>

            <div className="flex flex-wrap gap-3">

              {(task.labels || []).length > 0 ? (
                task.labels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300"
                  >
                    #{label}
                  </span>
                ))
              ) : (
                <span className="text-slate-500">
                  No labels assigned
                </span>
              )}

            </div>

          </section>

          {/* AI Insights */}

          <section className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-transparent">

            <div className="p-6">

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-black">
                  <Sparkles size={22} />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-white">
                    AI Insights
                  </h2>

                  <p className="text-sm text-cyan-200">
                    DevConnect AI Assistant
                  </p>

                </div>

              </div>

              <div className="mt-6 space-y-4">

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                  <h3 className="font-semibold text-cyan-300">
                    Suggested Improvements
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Break this task into smaller subtasks, assign an owner,
                    estimate implementation time and attach related GitHub PRs
                    to improve sprint visibility.
                  </p>

                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

                  <h3 className="font-semibold text-cyan-300">
                    Risk Analysis
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    Medium implementation complexity. Dependencies should be
                    completed before moving this task into Review.
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* Activity */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">

            <h2 className="mb-6 text-lg font-semibold text-white">
              Activity Timeline
            </h2>

            <div className="space-y-5">

              <div className="flex gap-4">

                <div className="mt-1 h-3 w-3 rounded-full bg-cyan-400" />

                <div>

                  <h3 className="font-medium text-white">
                    Task Created
                  </h3>

                  <p className="text-sm text-slate-400">
                    Initial task was created and added to the project.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <div className="mt-1 h-3 w-3 rounded-full bg-yellow-400" />

                <div>

                  <h3 className="font-medium text-white">
                    Status Updated
                  </h3>

                  <p className="text-sm text-slate-400">
                    Latest workflow status:
                    {" "}
                    <span className="capitalize text-cyan-300">
                      {task.status}
                    </span>
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* Actions */}

          <div className="grid grid-cols-2 gap-4">

            <button
              className="flex items-center justify-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 py-4 font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              <Pencil size={19} />
              Edit Task
            </button>

            <button
              onClick={deleteTask}
              className="flex items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 py-4 font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <Trash2 size={19} />
              Delete Task
            </button>

          </div>
                    {/* Comments */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold text-white">
                  Discussion
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Team collaboration & task updates
                </p>

              </div>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {(task.comments || []).length} Comments
              </span>

            </div>

            <TaskComments task={task} />

          </section>

        </div>

      </aside>

    </>
  );
}

export default TaskDetailsDrawer;