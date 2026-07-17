import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

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

        <div className="space-y-5">

          <input
            name="title"
            placeholder="Task title"
            value={form.title}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#263243] bg-[#0B1220] p-4 outline-none focus:border-cyan-400"
          />

          <textarea
            rows="5"
            name="description"
            placeholder="Task description..."
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#263243] bg-[#0B1220] p-4 outline-none focus:border-cyan-400"
          />

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#263243] bg-[#0B1220] p-4"
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

          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#263243] bg-[#0B1220] p-4"
          />

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-xl border border-[#263243] px-5 py-3"
          >
            Cancel
          </button>

          <button
            onClick={createTask}
            disabled={loading}
            className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black hover:bg-cyan-300 disabled:opacity-60"
          >
            {loading
              ? "Creating..."
              : "Create Task"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default CreateTaskModal;