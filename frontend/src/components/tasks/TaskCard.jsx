import {
  CalendarDays,
  Flag,
  User,
  CircleDashed,
} from "lucide-react";

function priorityColor(priority) {
  switch (priority?.toLowerCase()) {
    case "high":
      return "bg-red-500/20 text-red-400";

    case "medium":
      return "bg-yellow-500/20 text-yellow-400";

    case "low":
      return "bg-green-500/20 text-green-400";

    default:
      return "bg-cyan-500/20 text-cyan-400";
  }
}

function TaskCard({ task }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 transition hover:border-cyan-400 hover:-translate-y-1">

      <h3 className="text-lg font-semibold">
        {task.title}
      </h3>

      <p className="mt-3 line-clamp-3 text-sm text-gray-400">
        {task.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityColor(
            task.priority
          )}`}
        >
          <Flag size={12} className="mr-1 inline" />
          {task.priority || "Normal"}
        </span>

        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs">

          <CircleDashed
            size={12}
            className="mr-1 inline"
          />

          {task.status}

        </span>

      </div>

      <div className="mt-6 space-y-2 text-sm text-gray-400">

        <div className="flex items-center gap-2">

          <User size={15} />

          {task.assignedTo?.name || "Unassigned"}

        </div>

        <div className="flex items-center gap-2">

          <CalendarDays size={15} />

          {task.dueDate
            ? new Date(task.dueDate).toLocaleDateString()
            : "No Due Date"}

        </div>

      </div>

    </div>
  );
}

export default TaskCard;