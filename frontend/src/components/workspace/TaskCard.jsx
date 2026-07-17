import {
  CalendarDays,
  Flag,
  MessageSquare,
  User,
  Clock3,
  Tag,
} from "lucide-react";

function priorityColor(priority) {
  switch ((priority || "").toLowerCase()) {
    case "high":
      return "bg-red-500/15 text-red-400 border-red-500/20";

    case "medium":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-500/20";

    case "low":
      return "bg-green-500/15 text-green-400 border-green-500/20";

    default:
      return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
  }
}

function getDeadline(deadline) {
  if (!deadline)
    return {
      text: "No deadline",
      color: "text-gray-500",
    };

  const today = new Date();

  const due = new Date(deadline);

  const diff = Math.ceil(
    (due - today) / (1000 * 60 * 60 * 24)
  );

  if (diff < 0) {
    return {
      text: "Overdue",
      color: "text-red-400",
    };
  }

  if (diff === 0) {
    return {
      text: "Today",
      color: "text-yellow-400",
    };
  }

  return {
    text: `${diff} day${diff > 1 ? "s" : ""} left`,
    color: "text-cyan-400",
  };
}

function TaskCard({
  task,
  onClick,
}) {
  const deadline = getDeadline(task.deadline);

  return (
    <div
      onClick={() => onClick(task)}
      className="group cursor-pointer rounded-3xl border border-[#263243] bg-[#0B1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/10"
    >
      {/* Header */}

      <div className="flex items-start justify-between gap-3">

        <h3 className="line-clamp-2 text-lg font-semibold text-white">

          {task.title}

        </h3>

        <Flag
          size={17}
          className="text-yellow-400"
        />

      </div>

      {/* Description */}

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">

        {task.description || "No description"}

      </p>

      {/* Labels */}

      <div className="mt-5 flex flex-wrap gap-2">

        {(task.labels || []).map((label) => (
          <span
            key={label}
            className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
          >
            <Tag size={11} />
            {label}
          </span>
        ))}

      </div>

      {/* Priority */}

      <div className="mt-5 flex items-center justify-between">

        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${priorityColor(
            task.priority
          )}`}
        >
          {(task.priority || "Medium").toUpperCase()}
        </span>

        <div className="flex items-center gap-2 text-xs text-gray-500">

          <Clock3 size={14} />

          {task.estimate || "—"}

        </div>

      </div>

      {/* Assignee */}

      <div className="mt-5 flex items-center gap-3">

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 font-semibold text-black">

          {task.assignedTo?.name
            ? task.assignedTo.name.charAt(0)
            : "?"}

        </div>

        <div>

          <p className="text-sm font-medium text-white">

            {task.assignedTo?.name ||
              "Unassigned"}

          </p>

          <p className="text-xs text-gray-500">
            Assignee
          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-5 flex items-center justify-between border-t border-[#263243] pt-4">

        <div
          className={`flex items-center gap-2 text-xs ${deadline.color}`}
        >
          <CalendarDays size={14} />

          {deadline.text}

        </div>

        <div className="flex items-center gap-4 text-gray-500">

          <div className="flex items-center gap-1 text-xs">

            <MessageSquare size={14} />

            {task.comments?.length || 0}

          </div>

          <div className="flex items-center gap-1 text-xs">

            <User size={14} />

            1

          </div>

        </div>

      </div>

    </div>
  );
}

export default TaskCard;