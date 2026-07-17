import { Circle } from "lucide-react";
import TaskCard from "./TaskCard";

function TaskColumn({ title, tasks = [] }) {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827]">

      <div className="flex items-center justify-between border-b border-[#263243] p-5">

        <div className="flex items-center gap-3">

          <Circle size={10} className="fill-cyan-400 text-cyan-400" />

          <h2 className="font-semibold text-white">
            {title}
          </h2>

        </div>

        <span className="rounded-full bg-[#0B1220] px-3 py-1 text-xs text-cyan-300">
          {tasks.length}
        </span>

      </div>

      <div className="space-y-4 p-4 min-h-[520px]">

        {tasks.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-[#2b3b4d] text-sm text-gray-500">
            No Tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))
        )}

      </div>

    </div>
  );
}

export default TaskColumn;