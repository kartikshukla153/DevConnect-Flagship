import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import TaskCard from "./TaskCard";

const META = {
  todo: { dot: "bg-sky-400", tint: "bg-sky-500/5", text: "text-sky-300" },
  "in-progress": { dot: "bg-amber-400", tint: "bg-amber-500/5", text: "text-amber-300" },
  review: { dot: "bg-violet-400", tint: "bg-violet-500/5", text: "text-violet-300" },
  completed: { dot: "bg-emerald-400", tint: "bg-emerald-500/5", text: "text-emerald-300" },
};

function TaskColumn({ id, title, tasks = [], totalTasks = 0, onTaskClick, onAddTask, busyTaskId }) {
  const meta = META[id] || META.todo;
  const percentage = totalTasks ? Math.round((tasks.length / totalTasks) * 100) : 0;

  return (
    <section className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]">
      <header className={`border-b border-white/5 p-4 ${meta.tint}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
            <h3 className="truncate text-sm font-semibold text-white">{title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.tint} ${meta.text}`}>{tasks.length}</span>
          </div>
          <button onClick={onAddTask} title={`Create ${title} task`} className="rounded-lg border border-white/10 p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"><Plus size={14} /></button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500"><span>{percentage}% of visible work</span><span>{tasks.length} tasks</span></div>
      </header>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 space-y-3 p-3 transition ${snapshot.isDraggingOver ? "bg-cyan-500/5" : ""}`}>
            {tasks.map((task, index) => (
              <Draggable key={task._id} draggableId={String(task._id)} index={index} isDragDisabled={busyTaskId === task._id}>
                {(provided, dragSnapshot) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={dragSnapshot.isDragging ? "rotate-[.5deg] opacity-90" : ""}>
                    <TaskCard task={task} onClick={onTaskClick} busy={busyTaskId === task._id} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {tasks.length === 0 && <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0B1220] p-5 text-center"><div><p className="text-sm font-medium text-slate-400">No work here</p><p className="mt-1 text-xs leading-5 text-slate-600">Drop a task here or create one.</p></div></div>}
          </div>
        )}
      </Droppable>
    </section>
  );
}

export default TaskColumn;
