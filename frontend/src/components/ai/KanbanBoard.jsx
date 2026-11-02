import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { AlertCircle, Check, Circle, Clock3, Eye, Loader2 } from "lucide-react";
import api from "../../api/axios";
import TaskCard from "./TaskCard";

const COLUMNS = [
  { title: "To do", status: "todo", tone: "slate", icon: Circle },
  { title: "In progress", status: "in-progress", tone: "blue", icon: Clock3 },
  { title: "In review", status: "review", tone: "amber", icon: Eye },
  { title: "Completed", status: "completed", tone: "emerald", icon: Check },
];

const TONE_STYLES = {
  slate: "border-slate-500/20 bg-slate-400/[0.07] text-slate-300",
  blue: "border-blue-400/20 bg-blue-400/[0.08] text-blue-200",
  amber: "border-amber-300/20 bg-amber-300/[0.08] text-amber-200",
  emerald: "border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-200",
};

export default function KanbanBoard({ tasks = [], onTasksChange, refreshWorkspace }) {
  const [savingTaskId, setSavingTaskId] = useState("");
  const [error, setError] = useState("");

  const onDragEnd = async ({ destination, source, draggableId }) => {
    if (!destination || destination.droppableId === source.droppableId) return;

    const taskId = String(draggableId);
    const previousTasks = tasks;
    const nextStatus = destination.droppableId;
    const movedTask = tasks.find((task) => String(task._id) === taskId);

    if (!movedTask || savingTaskId) return;

    const optimisticTasks = tasks.map((task) =>
      String(task._id) === taskId ? { ...task, status: nextStatus } : task
    );

    setError("");
    setSavingTaskId(taskId);
    onTasksChange?.(optimisticTasks);

    try {
      const { data } = await api.put(`/tasks/status/${taskId}`, { status: nextStatus });
      if (data?.task) {
        onTasksChange?.(
          optimisticTasks.map((task) =>
            String(task._id) === taskId ? data.task : task
          )
        );
      }
    } catch (requestError) {
      onTasksChange?.(previousTasks);
      setError(
        requestError.response?.data?.message ||
        "Task movement failed. The previous status has been restored."
      );
      // Reconcile with the server in case the request reached it but the response was lost.
      refreshWorkspace?.().catch(() => {});
    } finally {
      setSavingTaskId("");
    }
  };

  return (
    <div>
      {error && (
        <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg border border-rose-400/15 bg-rose-400/[0.06] px-3 py-2.5 text-xs text-rose-300">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          {error}
          <button type="button" onClick={() => setError("")} className="ml-auto text-rose-200 underline underline-offset-2">Dismiss</button>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="overflow-x-auto pb-3">
          <div className="grid min-w-[1000px] grid-cols-4 items-start gap-3 xl:gap-4">
            {COLUMNS.map((column) => {
              const columnTasks = tasks.filter((task) => task.status === column.status);
              const Icon = column.icon;

              return (
                <Droppable droppableId={column.status} key={column.status}>
                  {(provided, snapshot) => (
                    <section className={`flex min-h-[430px] min-w-0 flex-col rounded-xl border bg-[#0E1725] p-2.5 transition-colors ${
                      snapshot.isDraggingOver ? "border-cyan-300/35 bg-cyan-300/[0.025]" : "border-white/[0.07]"
                    }`}>
                      <header className={`mb-2.5 flex items-center justify-between rounded-lg border px-3 py-3 ${TONE_STYLES[column.tone]}`}>
                        <div className="flex items-center gap-2">
                          <Icon size={14} />
                          <h3 className="text-xs font-semibold">{column.title}</h3>
                        </div>
                        <span className="rounded-md bg-black/15 px-2 py-1 text-[10px] font-semibold tabular-nums">{columnTasks.length}</span>
                      </header>

                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex max-h-[620px] min-h-[340px] flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden rounded-lg p-1 transition-colors ${
                          snapshot.isDraggingOver ? "bg-cyan-300/[0.035]" : ""
                        }`}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={String(task._id)} index={index} isDragDisabled={Boolean(savingTaskId)}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                style={{
                                  ...dragProvided.draggableProps.style,
                                  opacity: dragSnapshot.isDragging ? 0.85 : 1,
                                }}
                                className={dragSnapshot.isDragging ? "rotate-[1deg]" : ""}
                              >
                                <TaskCard task={task} refreshWorkspace={refreshWorkspace} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {columnTasks.length === 0 && (
                          <div className="flex min-h-28 flex-1 items-center justify-center rounded-lg border border-dashed border-white/[0.09] px-3 text-center text-[11px] text-slate-600">
                            Drop a task here
                          </div>
                        )}
                      </div>
                      {savingTaskId && columnTasks.some((task) => String(task._id) === savingTaskId) && (
                        <p className="mt-2 flex items-center gap-1.5 px-1 text-[10px] text-cyan-300"><Loader2 size={11} className="animate-spin" /> Saving change</p>
                      )}
                    </section>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </DragDropContext>
      <p className="mt-1 text-[10px] text-slate-600">Drag a task between columns to update its workflow status. Changes are saved to the project.</p>
    </div>
  );
}
