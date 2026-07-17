import { Circle } from "lucide-react";
import {
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import TaskCard from "./TaskCard";

function TaskColumn({
  id,
  title,
  tasks = [],
}) {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827]">

      <div className="flex items-center justify-between border-b border-[#263243] p-5">

        <div className="flex items-center gap-3">

          <Circle
            size={10}
            className="fill-cyan-400 text-cyan-400"
          />

          <h2 className="font-semibold text-white">
            {title}
          </h2>

        </div>

        <span className="rounded-full bg-[#0B1220] px-3 py-1 text-xs text-cyan-300">
          {tasks.length}
        </span>

      </div>

      <Droppable droppableId={id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="min-h-[520px] space-y-4 p-4"
          >

            {tasks.map((task, index) => (
              <Draggable
                key={task._id}
                draggableId={task._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard task={task} />
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-[#2b3b4d] text-sm text-gray-500">
                Drop tasks here
              </div>
            )}

          </div>
        )}
      </Droppable>

    </div>
  );
}

export default TaskColumn;