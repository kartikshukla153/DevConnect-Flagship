import TaskColumn from "./TaskColumn";

function KanbanBoard({ tasks }) {
  return (
    <div className="grid gap-6 xl:grid-cols-4">

      <TaskColumn
        title="Todo"
        tasks={tasks.filter(
          (t) => t.status === "todo"
        )}
      />

      <TaskColumn
        title="In Progress"
        tasks={tasks.filter(
          (t) => t.status === "in-progress"
        )}
      />

      <TaskColumn
        title="Review"
        tasks={tasks.filter(
          (t) => t.status === "review"
        )}
      />

      <TaskColumn
        title="Completed"
        tasks={tasks.filter(
          (t) => t.status === "completed"
        )}
      />

    </div>
  );
}

export default KanbanBoard;