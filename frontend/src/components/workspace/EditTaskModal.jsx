import { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, X } from "lucide-react";

const API = "http://localhost:5000/api/tasks";

function EditTaskModal({
  open,
  onClose,
  task,
  reloadTasks,
}) {
  const token = localStorage.getItem("token");

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    deadline: "",
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || "",
        description:
          task.description || "",
        priority:
          task.priority || "medium",
        status: task.status || "todo",
        deadline: task.deadline
          ? task.deadline.slice(0, 10)
          : "",
      });
    }
  }, [task]);

  if (!open || !task) return null;

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  }

  async function saveTask() {
    try {
      setLoading(true);

      await axios.put(
        `${API}/status/${task._id}`,
        {
          status: form.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onClose();
      reloadTasks();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update task."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteTask() {
    if (
      !window.confirm(
        "Delete this task?"
      )
    )
      return;

    try {
      await axios.delete(
        `${API}/${task._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onClose();
      reloadTasks();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Delete failed."
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="w-full max-w-xl rounded-3xl border border-[#263243] bg-[#111827] p-8">

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Task Details
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="space-y-5">

          <input
            disabled
            value={form.title}
            className="w-full rounded-xl border border-[#263243] bg-[#0B1220] p-4 text-gray-400"
          />

          <textarea
            disabled
            rows="5"
            value={form.description}
            className="w-full rounded-xl border border-[#263243] bg-[#0B1220] p-4 text-gray-400"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-[#263243] bg-[#0B1220] p-4"
          >
            <option value="todo">
              Todo
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="review">
              Review
            </option>

            <option value="completed">
              Completed
            </option>
          </select>

        </div>

        <div className="mt-8 flex items-center justify-between">

          <button
            onClick={deleteTask}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 px-5 py-3 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 size={18} />
            Delete
          </button>

          <div className="flex gap-3">

            <button
              onClick={onClose}
              className="rounded-xl border border-[#263243] px-5 py-3"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              onClick={saveTask}
              className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black hover:bg-cyan-300"
            >
              {loading
                ? "Saving..."
                : "Save"}
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EditTaskModal;