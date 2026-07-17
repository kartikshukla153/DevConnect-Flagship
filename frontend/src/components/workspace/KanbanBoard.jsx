import TaskColumn from "./TaskColumn";

function KanbanBoard({ tasks }) {
  const todo = tasks.filter((t) => t.status === "todo");

  const progress = tasks.filter(
    (t) => t.status === "in-progress"
  );

  const review = tasks.filter(
    (t) => t.status === "review"
  );

  const completed = tasks.filter(
    (t) => t.status === "completed"
  );

  return (
    <div className="grid gap-6 xl:grid-cols-4">

      <TaskColumn
        title="Todo"
        tasks={todo}
      />

      <TaskColumn
        title="In Progress"
        tasks={progress}
      />

      <TaskColumn
        title="Review"
        tasks={review}
      />

      <TaskColumn
        title="Completed"
        tasks={completed}
      />

    </div>
  );
}

export default KanbanBoard;