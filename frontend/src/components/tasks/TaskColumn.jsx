import TaskCard from "./TaskCard";

function TaskColumn({
  title,
  tasks,
  emptyText = "No tasks",
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827]">

      <div className="border-b border-white/10 p-6">

        <div className="flex items-center justify-between">

          <h2 className="text-lg font-bold">
            {title}
          </h2>

          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-400">
            {tasks.length}
          </span>

        </div>

      </div>

      <div className="space-y-4 p-5">

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-500">
            {emptyText}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
            />
          ))
        )}

      </div>

    </div>
  );
}

export default TaskColumn;