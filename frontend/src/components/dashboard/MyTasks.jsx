import {
  CheckCircle2,
  Circle,
  Clock3,
  Flag,
} from "lucide-react";

const priorityColors = {
  High: "bg-red-500/10 text-red-400 border-red-500/20",
  Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function MyTasks({ tasks = [] }) {
  return (
    <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-white">
          My Tasks
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Stay on top of your current sprint.
        </p>

      </div>

      {tasks.length === 0 ? (

        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#263243]">

          <CheckCircle2
            size={34}
            className="text-cyan-400"
          />

          <h3 className="mt-5 text-lg font-semibold text-white">
            Nothing Pending
          </h3>

          <p className="mt-2 max-w-md text-center text-sm leading-7 text-gray-400">
            Once tasks are assigned to you, they'll appear here with
            priorities and deadlines.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {tasks.map((task) => (

            <div
              key={task._id}
              className="rounded-2xl border border-[#263243] bg-[#0B1220] p-5 transition-all duration-300 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10"
            >

              <div className="flex items-start justify-between">

                <div className="flex gap-4">

                  {task.completed ? (
                    <CheckCircle2
                      size={22}
                      className="mt-1 text-emerald-400"
                    />
                  ) : (
                    <Circle
                      size={22}
                      className="mt-1 text-gray-500"
                    />
                  )}

                  <div>

                    <h3 className="font-semibold text-white">
                      {task.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      {task.description}
                    </p>

                  </div>

                </div>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    priorityColors[task.priority] ||
                    priorityColors.Medium
                  }`}
                >
                  <Flag
                    size={12}
                    className="mr-1 inline"
                  />
                  {task.priority || "Medium"}
                </span>

              </div>

              <div className="mt-5 flex items-center gap-2 text-sm text-gray-500">

                <Clock3 size={15} />

                <span>
                  Due{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No deadline"}
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}

export default MyTasks;