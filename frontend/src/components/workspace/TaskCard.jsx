import {
  CalendarDays,
  Flag,
  MessageSquare,
} from "lucide-react";

function TaskCard({ task }) {
  return (
    <div className="cursor-pointer rounded-2xl border border-[#263243] bg-[#0B1220] p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-500">

      <h3 className="text-lg font-semibold text-white">
        {task.title}
      </h3>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-400">
        {task.description}
      </p>

      <div className="mt-5 flex items-center justify-between">

        <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">
          {task.priority || "Medium"}
        </span>

        <Flag size={16} className="text-yellow-400" />

      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#263243] pt-4 text-xs text-gray-500">

        <div className="flex items-center gap-2">
          <CalendarDays size={14} />
          {task.deadline
            ? new Date(task.deadline).toLocaleDateString()
            : "No deadline"}
        </div>

        <div className="flex items-center gap-2">
          <MessageSquare size={14} />
          0
        </div>

      </div>

    </div>
  );
}

export default TaskCard;