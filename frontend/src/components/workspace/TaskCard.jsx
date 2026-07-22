import {
  CalendarDays,
  Clock3,
  Flag,
  MessageSquare,
  Tag,
  User,
} from "lucide-react";

function priorityStyle(priority) {
  switch ((priority || "").toLowerCase()) {
    case "high":
      return {
        badge:
          "border-red-500/20 bg-red-500/10 text-red-400",
        dot: "bg-red-400",
      };

    case "medium":
      return {
        badge:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-300",
        dot: "bg-yellow-400",
      };

    case "low":
      return {
        badge:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        dot: "bg-emerald-400",
      };

    default:
      return {
        badge:
          "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
        dot: "bg-cyan-400",
      };
  }
}

function deadlineInfo(deadline) {
  if (!deadline)
    return {
      text: "No deadline",
      color: "text-slate-500",
    };

  const today = new Date();

  const due = new Date(deadline);

  const diff = Math.ceil(
    (due - today) /
      (1000 * 60 * 60 * 24)
  );

  if (diff < 0)
    return {
      text: "Overdue",
      color: "text-red-400",
    };

  if (diff === 0)
    return {
      text: "Today",
      color: "text-amber-400",
    };

  return {
    text: `${diff} day${
      diff > 1 ? "s" : ""
    } left`,
    color: "text-cyan-400",
  };
}

export default function TaskCard({
  task,
  onClick,
}) {
  const priority = priorityStyle(
    task.priority
  );

  const deadline = deadlineInfo(
    task.deadline
  );

  return (
    <article
      onClick={() =>
        onClick?.(task)
      }
      className="
        group
        cursor-pointer
        rounded-2xl
        border
        border-white/10
        bg-[#111827]
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-400/30
        hover:shadow-[0_18px_40px_rgba(34,211,238,0.08)]
      "
    >
      {/* top */}

      <div className="flex items-start justify-between gap-3">

        <h3 className="line-clamp-2 text-lg font-semibold text-white">
          {task.title}
        </h3>

        <Flag
          size={17}
          className="text-amber-400"
        />

      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
        {task.description ||
          "No description provided."}
      </p>

      {/* labels */}

      {(task.labels || []).length >
        0 && (
        <div className="mt-5 flex flex-wrap gap-2">

          {task.labels.map(
            (label) => (
              <span
                key={label}
                className="
                  flex
                  items-center
                  gap-1
                  rounded-lg
                  border
                  border-cyan-500/20
                  bg-cyan-500/10
                  px-2.5
                  py-1
                  text-xs
                  text-cyan-300
                "
              >
                <Tag size={11} />
                {label}
              </span>
            )
          )}

        </div>
      )}

      {/* priority */}

      <div className="mt-5 flex items-center justify-between">

        <div
          className={`
            flex
            items-center
            gap-2
            rounded-full
            border
            px-3
            py-1
            text-xs
            font-semibold
            ${priority.badge}
          `}
        >

          <div
            className={`h-2 w-2 rounded-full ${priority.dot}`}
          />

          {(task.priority ||
            "Medium")
            .charAt(0)
            .toUpperCase() +
            (
              task.priority ||
              "Medium"
            ).slice(1)}

        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">

          <Clock3 size={14} />

          {task.estimate ||
            "--"}

        </div>

      </div>

      {/* assignee */}

      <div className="mt-6 flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-cyan-400
              font-bold
              text-black
            "
          >
            {task.assignedTo?.name
              ? task.assignedTo.name.charAt(
                  0
                )
              : "?"}
          </div>

          <div>

            <p className="text-sm font-medium text-white">
              {task.assignedTo
                ?.name ||
                "Unassigned"}
            </p>

            <p className="text-xs text-slate-500">
              Assignee
            </p>

          </div>

        </div>

      </div>

      {/* footer */}

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">

        <div
          className={`flex items-center gap-2 text-xs ${deadline.color}`}
        >

          <CalendarDays
            size={14}
          />

          {deadline.text}

        </div>

        <div className="flex items-center gap-4 text-slate-500">

          <div className="flex items-center gap-1 text-xs">

            <MessageSquare
              size={14}
            />

            {task.comments
              ?.length || 0}

          </div>

          <div className="flex items-center gap-1 text-xs">

            <User size={14} />

            1

          </div>

        </div>

      </div>
    </article>
  );
}