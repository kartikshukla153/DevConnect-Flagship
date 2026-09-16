import { useEffect, useState } from "react";
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
  CheckCircle2,
  Tag,
  Save,
  CircleDot,
  AlertTriangle,
} from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

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

function statusStyle(status) {
  switch ((status || "").toLowerCase()) {
    case "todo":
      return "border-sky-500/20 bg-sky-500/10 text-sky-400";

    case "in-progress":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";

    case "review":
      return "border-violet-500/20 bg-violet-500/10 text-violet-400";

    case "completed":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

    default:
      return "border-cyan-500/20 bg-cyan-500/10 text-cyan-300";
  }
}

function formatStatus(status) {
  if (!status) return "Unknown";

  return status
    .replace("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(date) {
  if (!date) return "No deadline";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "No deadline";
  }

  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDateInputValue(date) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function TaskDetailsDrawer({
  open,
  task,
  onClose,
  reloadTasks,
}) {
  const token = localStorage.getItem("token");

  const [editing, setEditing] = useState(false);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
  });

  useEffect(() => {
    if (!task) return;

    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      deadline: getDateInputValue(task.deadline),
    });

    setEditing(false);
  }, [task]);

  if (!task) return null;

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  async function saveTask() {
    if (!form.title.trim()) {
      alert("Task title is required.");
      return;
    }

    try {
      setSaving(true);

      await axios.put(
        `${API}/tasks/${task._id}`,
        {
          title: form.title.trim(),
          description: form.description,
          priority: form.priority,
          deadline: form.deadline || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditing(false);

      if (reloadTasks) {
        await reloadTasks();
      }
    } catch (err) {
      console.error("UPDATE TASK ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update task."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(status) {
    if (status === task.status) return;

    try {
      setUpdatingStatus(true);

      await axios.put(
        `${API}/tasks/status/${task._id}`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (reloadTasks) {
        await reloadTasks();
      }
    } catch (err) {
      console.error("UPDATE TASK STATUS ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update task status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function deleteTask() {
    const confirmed = window.confirm(
      `Delete "${task.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await axios.delete(
        `${API}/tasks/${task._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (reloadTasks) {
        await reloadTasks();
      }

      onClose();
    } catch (err) {
      console.error("DELETE TASK ERROR:", err);

      alert(
        err.response?.data?.message ||
          "Unable to delete task."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          open
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}

      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-[620px] flex-col border-l border-white/10 bg-[#0F172A] shadow-[0_0_80px_rgba(0,0,0,.5)] transition-all duration-500 ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        {/* HEADER */}

        <div className="sticky top-0 z-30 border-b border-white/10 bg-[#111827]/95 px-6 py-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
                Task Details
              </p>

              {!editing ? (
                <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-white">
                  {task.title}
                </h1>
              ) : (
                <input
                  value={form.title}
                  onChange={(e) =>
                    updateField(
                      "title",
                      e.target.value
                    )
                  }
                  className="
                    mt-3
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-[#0B1220]
                    px-4
                    py-3
                    text-lg
                    font-semibold
                    text-white
                    outline-none
                    transition
                    focus:border-cyan-400
                  "
                />
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${priorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority || "Medium"}
                </span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${statusStyle(
                    task.status
                  )}`}
                >
                  {formatStatus(task.status)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="
                shrink-0
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-3
                text-slate-400
                transition
                hover:border-cyan-400/30
                hover:bg-cyan-500/10
                hover:text-cyan-300
              "
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SCROLL AREA */}

        <div className="flex-1 space-y-7 overflow-y-auto p-6">
          {/* STATUS WORKFLOW */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">
                  Workflow Status
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Move the task through the project workflow.
                </p>
              </div>

              {updatingStatus && (
                <span className="text-xs text-cyan-400">
                  Updating...
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  value: "todo",
                  label: "Todo",
                },
                {
                  value: "in-progress",
                  label: "In Progress",
                },
                {
                  value: "review",
                  label: "Review",
                },
                {
                  value: "completed",
                  label: "Completed",
                },
              ].map((item) => {
                const active =
                  task.status === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() =>
                      updateStatus(item.value)
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      px-3
                      py-3
                      text-left
                      text-sm
                      font-medium
                      transition
                      ${
                        active
                          ? statusStyle(
                              item.value
                            )
                          : "border-white/10 bg-[#0B1220] text-slate-400 hover:border-cyan-400/30 hover:text-white"
                      }
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    `}
                  >
                    <CircleDot size={15} />

                    {item.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* META GRID */}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <User size={17} />

                <span className="text-xs uppercase tracking-widest">
                  Assignee
                </span>
              </div>

              <h3 className="font-semibold text-white">
                {task.assignedTo?.name ||
                  "Unassigned"}
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
                {formatDate(task.deadline)}
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
                {task.estimatedHours
                  ? `${task.estimatedHours}h`
                  : task.estimate || "--"}
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111827] p-5">
              <div className="mb-3 flex items-center gap-2 text-cyan-300">
                <CheckCircle2 size={17} />

                <span className="text-xs uppercase tracking-widest">
                  Story Points
                </span>
              </div>

              <h3 className="font-semibold text-white">
                {task.storyPoints ?? "--"}
              </h3>
            </div>
          </div>

          {/* DESCRIPTION / EDIT */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Description
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Task overview and implementation details
                </p>
              </div>

              {!editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-cyan-500/20
                    bg-cyan-500/10
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-cyan-300
                    transition
                    hover:bg-cyan-500/20
                  "
                >
                  <Pencil size={15} />

                  Edit
                </button>
              )}
            </div>

            {!editing ? (
              <p className="whitespace-pre-wrap leading-8 text-slate-300">
                {task.description ||
                  "No description has been added for this task."}
              </p>
            ) : (
              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                rows={7}
                placeholder="Describe what needs to be implemented..."
                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#0B1220]
                  p-4
                  leading-7
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-400
                "
              />
            )}
          </section>

          {/* EDIT FIELDS */}

          {editing && (
            <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-6">
              <div className="mb-5">
                <h2 className="font-semibold text-white">
                  Task Configuration
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update the core task information.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(e) =>
                      updateField(
                        "priority",
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-[#0B1220]
                      px-4
                      py-3
                      text-white
                      outline-none
                      focus:border-cyan-400
                    "
                  >
                    <option value="low">
                      Low
                    </option>

                    <option value="medium">
                      Medium
                    </option>

                    <option value="high">
                      High
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Deadline
                  </label>

                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) =>
                      updateField(
                        "deadline",
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-[#0B1220]
                      px-4
                      py-3
                      text-white
                      outline-none
                      focus:border-cyan-400
                    "
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);

                    setForm({
                      title:
                        task.title || "",
                      description:
                        task.description || "",
                      priority:
                        task.priority ||
                        "medium",
                      deadline:
                        getDateInputValue(
                          task.deadline
                        ),
                    });
                  }}
                  className="
                    rounded-xl
                    border
                    border-white/10
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-slate-300
                    transition
                    hover:bg-white/5
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveTask}
                  disabled={saving}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-cyan-400
                    px-5
                    py-2.5
                    text-sm
                    font-semibold
                    text-black
                    transition
                    hover:bg-cyan-300
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Save size={16} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </section>
          )}

          {/* LABELS */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <Tag size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Labels
                </h2>

                <p className="text-xs text-slate-500">
                  Categorization
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {(task.labels || []).length >
              0 ? (
                task.labels.map((label) => (
                  <span
                    key={label}
                    className="
                      rounded-full
                      border
                      border-cyan-500/20
                      bg-cyan-500/10
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-cyan-300
                    "
                  >
                    #{label}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">
                  No labels assigned
                </span>
              )}
            </div>
          </section>

          {/* TASK INFORMATION */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <AlertTriangle size={18} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Delivery Information
                </h2>

                <p className="text-xs text-slate-500">
                  Engineering execution details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#0B1220] p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Difficulty
                </p>

                <p className="mt-2 font-semibold text-white">
                  {task.difficulty ||
                    "Not specified"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B1220] p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Estimated Hours
                </p>

                <p className="mt-2 font-semibold text-white">
                  {task.estimatedHours ??
                    "--"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B1220] p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Dependencies
                </p>

                <p className="mt-2 font-semibold text-white">
                  {(task.dependencies ||
                    []).length}
                </p>
              </div>

              <div className="rounded-2xl bg-[#0B1220] p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Acceptance Criteria
                </p>

                <p className="mt-2 font-semibold text-white">
                  {(task.acceptanceCriteria ||
                    []).length}
                </p>
              </div>
            </div>
          </section>

          {/* ACTIVITY */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">
              Activity
            </h2>

            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-cyan-400" />

                <div>
                  <h3 className="font-medium text-white">
                    Task Created
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Initial task was created and added
                    to the project.
                  </p>

                  {task.createdAt && (
                    <p className="mt-2 text-xs text-slate-600">
                      {formatDate(task.createdAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-yellow-400" />

                <div>
                  <h3 className="font-medium text-white">
                    Current Status
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Task is currently in{" "}
                    <span className="capitalize text-cyan-300">
                      {formatStatus(
                        task.status
                      )}
                    </span>
                    .
                  </p>
                </div>
              </div>

              {task.updatedAt &&
                task.updatedAt !==
                  task.createdAt && (
                  <div className="flex gap-4">
                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-violet-400" />

                    <div>
                      <h3 className="font-medium text-white">
                        Last Updated
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        Task information was
                        updated.
                      </p>

                      <p className="mt-2 text-xs text-slate-600">
                        {formatDate(
                          task.updatedAt
                        )}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* COMMENTS */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Discussion
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Team collaboration and task updates
                </p>
              </div>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                {(task.comments || []).length}{" "}
                Comments
              </span>
            </div>

            <TaskComments task={task} />
          </section>

          {/* DANGER ZONE */}

          <section className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6">
            <div>
              <h2 className="font-semibold text-white">
                Danger Zone
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Deleting this task permanently removes
                it from the project.
              </p>
            </div>

            <button
              type="button"
              onClick={deleteTask}
              disabled={deleting}
              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                py-3
                font-semibold
                text-red-400
                transition
                hover:bg-red-500/20
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Trash2 size={17} />

              {deleting
                ? "Deleting..."
                : "Delete Task"}
            </button>
          </section>
        </div>
      </aside>
    </>
  );
}

export default TaskDetailsDrawer;