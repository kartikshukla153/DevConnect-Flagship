import axios from "axios";
import {
  X,
  CalendarDays,
  User,
  Flag,
  Pencil,
  Trash2,
} from "lucide-react";

const API = "http://localhost:5000/api";

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
    <div
      className={`fixed right-0 top-0 z-50 h-screen w-[430px] border-l border-[#263243] bg-[#111827] transition-all duration-300 ${
        open
          ? "translate-x-0"
          : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#263243] p-6">

        <h2 className="text-xl font-bold">
          Task Details
        </h2>

        <button onClick={onClose}>
          <X />
        </button>

      </div>

      <div className="space-y-8 p-8">

        <div>

          <h1 className="text-3xl font-bold">
            {task.title}
          </h1>

          <p className="mt-5 leading-7 text-gray-300">
            {task.description}
          </p>

        </div>

        <div className="space-y-5">

          <div className="flex items-center gap-3">
            <User size={18} />
            {task.assignedTo?.name || "Unassigned"}
          </div>

          <div className="flex items-center gap-3">
            <Flag size={18} />
            {task.priority}
          </div>

          <div className="flex items-center gap-3">
            <CalendarDays size={18} />
            {task.deadline
              ? new Date(
                  task.deadline
                ).toLocaleDateString()
              : "No deadline"}
          </div>

        </div>

        <div className="flex gap-4">

          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 py-3 font-semibold text-black">
            <Pencil size={18} />
            Edit
          </button>

          <button
            onClick={deleteTask}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-semibold"
          >
            <Trash2 size={18} />
            Delete
          </button>

        </div>

      </div>
    </div>
  );
}

export default TaskDetailsDrawer;