import { useState } from "react";
import axios from "axios";
import {
  X,
  Sparkles,
  Flag,
  CalendarDays,
  ClipboardList,
  Clock3,
  CheckCircle2,
} from "lucide-react";
const API = "http://localhost:5000/api/tasks";

function CreateTaskModal({
  open,
  onClose,
  projectId,
  reloadTasks,
}) {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createTask = async () => {
    if (!form.title.trim()) {
      alert("Task title is required");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        API,
        {
          ...form,
          projectId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setForm({
        title: "",
        description: "",
        priority: "medium",
        deadline: "",
      });

      reloadTasks();

      onClose();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to create task."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="w-full max-w-xl rounded-3xl border border-[#263243] bg-[#111827] p-8">

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Create New Task
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">

  {/* LEFT */}

  <div className="space-y-6">

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-300">
        Task Title
      </label>

      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Design Authentication Flow..."
        className="
          w-full
          rounded-2xl
          border
          border-white/10
          bg-[#0B1220]
          px-5
          py-4
          text-white
          outline-none
          transition
          placeholder:text-slate-500
          focus:border-cyan-400
        "
      />

    </div>

    <div>

      <label className="mb-2 block text-sm font-semibold text-slate-300">
        Description
      </label>

      <textarea
        rows={9}
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Describe the task in detail..."
        className="
          w-full
          resize-none
          rounded-2xl
          border
          border-white/10
          bg-[#0B1220]
          p-5
          text-white
          outline-none
          transition
          placeholder:text-slate-500
          focus:border-cyan-400
        "
      />

    </div>

    <div className="grid gap-5 md:grid-cols-2">

      <div>

        <label className="mb-2 block text-sm font-semibold text-slate-300">
          Priority
        </label>

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-[#0B1220]
            px-5
            py-4
            text-white
            outline-none
            focus:border-cyan-400
          "
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>

      </div>

      <div>

        <label className="mb-2 block text-sm font-semibold text-slate-300">
          Deadline
        </label>

        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className="
            w-full
            rounded-2xl
            border
            border-white/10
            bg-[#0B1220]
            px-5
            py-4
            text-white
            outline-none
            focus:border-cyan-400
          "
        />

      </div>

    </div>

  </div>

  {/* RIGHT */}

  <div className="space-y-6">

   <div className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-sky-500/5">

  <div className="border-b border-cyan-500/20 p-6">

    <div className="flex items-center gap-3">

      <div className="rounded-2xl bg-cyan-400 p-3 text-black">

        <Sparkles size={20} />

      </div>

      <div>

        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
          AI Assistant
        </p>

        <h3 className="text-xl font-bold">
          Smart Planning
        </h3>

      </div>

    </div>

  </div>

  <div className="space-y-4 p-6">

    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
    >
      <ClipboardList size={18} />

      Generate Description

    </button>

    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
    >
      <Clock3 size={18} />

      Estimate Time

    </button>

    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-400/40 hover:bg-cyan-500/10"
    >
      <CheckCircle2 size={18} />

      Split Into Subtasks

    </button>

  </div>

</div>

    <div className="rounded-3xl border border-white/10 bg-[#0B1220] p-6">

  <h3 className="text-lg font-bold">
    Quick Checklist
  </h3>

  <div className="mt-5 space-y-4">

    <div className="flex items-center gap-3">

      <Flag className="text-cyan-400" size={18} />

      <span className="text-sm text-slate-300">
        Set the right priority
      </span>

    </div>

    <div className="flex items-center gap-3">

      <CalendarDays
        className="text-cyan-400"
        size={18}
      />

      <span className="text-sm text-slate-300">
        Choose a realistic deadline
      </span>

    </div>

    <div className="flex items-center gap-3">

      <ClipboardList
        className="text-cyan-400"
        size={18}
      />

      <span className="text-sm text-slate-300">
        Add enough implementation details
      </span>

    </div>

    <div className="flex items-center gap-3">

      <CheckCircle2
        className="text-cyan-400"
        size={18}
      />

      <span className="text-sm text-slate-300">
        Keep every task independently deployable
      </span>

    </div>

  </div>

</div>

  </div>

</div>

<div className="mt-10 flex justify-end gap-4 border-t border-white/10 pt-6">

  <button
    onClick={onClose}
    className="
      rounded-2xl
      border
      border-white/10
      px-6
      py-3
      text-slate-300
      transition
      hover:bg-white/5
    "
  >
    Cancel
  </button>

  <button
    onClick={createTask}
    disabled={loading}
    className="
      rounded-2xl
      bg-cyan-400
      px-8
      py-3
      font-semibold
      text-black
      transition
      hover:scale-105
      hover:bg-cyan-300
      disabled:opacity-60
    "
  >
    {loading ? "Creating..." : "Create Task"}
  </button>

</div>

      </div>

    </div>
  );
}

export default CreateTaskModal;