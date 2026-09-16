import { DragDropContext } from "@hello-pangea/dnd";
import { useMemo, useState } from "react";
import TaskColumn from "./TaskColumn";

const STATUSES = ["todo", "in-progress", "review", "completed"];

function buildColumns(tasks) {
  return STATUSES.reduce((acc, status) => {
    acc[status] = tasks.filter((task) => task.status === status);
    return acc;
  }, {});
}

function KanbanBoard({ tasks = [], onTaskClick, onTaskStatusChange, onAddTask }) {
  const columns = useMemo(() => buildColumns(tasks), [tasks]);
  const [busyTaskId, setBusyTaskId] = useState(null);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const nextStatus = destination.droppableId;
    setBusyTaskId(draggableId);
    try {
      await onTaskStatusChange?.(draggableId, nextStatus);
    } finally {
      setBusyTaskId(null);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Task board</h2>
          <p className="mt-1 text-xs text-slate-500">Move work through the delivery pipeline.</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">{tasks.length} visible</span>
      </div>

      <div className="grid gap-4 2xl:grid-cols-4 xl:grid-cols-2">
        <TaskColumn id="todo" title="Todo" tasks={columns.todo} totalTasks={tasks.length} onTaskClick={onTaskClick} onAddTask={onAddTask} busyTaskId={busyTaskId} />
        <TaskColumn id="in-progress" title="In progress" tasks={columns["in-progress"]} totalTasks={tasks.length} onTaskClick={onTaskClick} onAddTask={onAddTask} busyTaskId={busyTaskId} />
        <TaskColumn id="review" title="Review" tasks={columns.review} totalTasks={tasks.length} onTaskClick={onTaskClick} onAddTask={onAddTask} busyTaskId={busyTaskId} />
        <TaskColumn id="completed" title="Completed" tasks={columns.completed} totalTasks={tasks.length} onTaskClick={onTaskClick} onAddTask={onAddTask} busyTaskId={busyTaskId} />
      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;
