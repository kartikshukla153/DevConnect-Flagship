import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Circle,
  Plus,
  TrendingUp,
} from "lucide-react";

import TaskCard from "./TaskCard";

const COLUMN_META = {
  todo: {
    color: "bg-sky-500",
    light: "bg-sky-500/10",
    text: "text-sky-400",
  },
  "in-progress": {
    color: "bg-amber-500",
    light: "bg-amber-500/10",
    text: "text-amber-400",
  },
  review: {
    color: "bg-violet-500",
    light: "bg-violet-500/10",
    text: "text-violet-400",
  },
  completed: {
    color: "bg-emerald-500",
    light: "bg-emerald-500/10",
    text: "text-emerald-400",
  },
};

function TaskColumn({
  id,
  title,
  tasks = [],
  totalTasks = 0,
  onTaskClick,
})
 {
  const meta = COLUMN_META[id];

  const percentage =
    totalTasks === 0
      ? 0
      : Math.round((tasks.length / totalTasks) * 100);

  return (
    <div
      className="
        group
        flex
        min-h-[760px]
        flex-col
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-[#0F172A]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-cyan-500/40
        hover:shadow-2xl
        hover:shadow-cyan-500/5
      "
    >
      <div
        className="
          sticky
          top-0
          z-20
          border-b
          border-white/10
          bg-[#111827]/95
          p-5
          backdrop-blur-xl
        "
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div
                className={`h-3 w-3 rounded-full ${meta.color}`}
              />

              <h2 className="text-lg font-semibold text-white">
                {title}
              </h2>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-semibold
                  ${meta.light}
                  ${meta.text}
                `}
              >
                {tasks.length}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {percentage}% of project
              </span>

              <span className={meta.text}>
                {tasks.length} Tasks
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#0B1220]">
              <div
                className={`h-full rounded-full ${meta.color} transition-all duration-700`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>

          <button
            className="
              rounded-xl
              border
              border-white/10
              bg-white/5
              p-2
              text-slate-400
              transition-all
              hover:border-cyan-500/40
              hover:bg-cyan-500/10
              hover:text-cyan-300
            "
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1
              space-y-4
              p-4
              transition-all
              duration-300
              ${
                snapshot.isDraggingOver
                  ? "bg-cyan-500/5"
                  : ""
              }
            `}
          >
            {tasks.map((task, index) => (
              <Draggable
                key={task._id}
                draggableId={task._id}
                index={index}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`
                      transition-all
                      duration-300
                      ${
                        snapshot.isDragging
                          ? "rotate-1 scale-[1.03]"
                          : ""
                      }
                    `}
                  >
                    <TaskCard
  task={task}
  onClick={onTaskClick}
/>
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}

            {tasks.length === 0 && (
              <div
                className="
                  flex
                  h-60
                  flex-col
                  items-center
                  justify-center
                  rounded-3xl
                  border-2
                  border-dashed
                  border-[#243244]
                  bg-[#0B1220]
                  text-center
                "
              >
                <div
                  className={`
                    mb-5
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    ${meta.light}
                  `}
                >
                  <TrendingUp
                    className={meta.text}
                    size={26}
                  />
                </div>

                <h3 className="font-semibold text-white">
                  Nothing here yet
                </h3>

                <p className="mt-3 max-w-[220px] text-sm leading-6 text-slate-500">
                  Drag a task into this column or create a
                  new task to continue your workflow.
                </p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default TaskColumn;