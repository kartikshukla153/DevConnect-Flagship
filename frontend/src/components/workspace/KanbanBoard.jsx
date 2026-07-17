import { DragDropContext } from "@hello-pangea/dnd";
import axios from "axios";
import { useEffect, useState } from "react";

import TaskColumn from "./TaskColumn";

const API = "http://localhost:5000/api";

function KanbanBoard({
  tasks,
  reloadTasks,
  onTaskClick,
}) {
  const token = localStorage.getItem("token");

  const [columns, setColumns] = useState({
    todo: [],
    "in-progress": [],
    review: [],
    completed: [],
  });

  useEffect(() => {
    setColumns({
      todo: tasks.filter((t) => t.status === "todo"),
      "in-progress": tasks.filter(
        (t) => t.status === "in-progress"
      ),
      review: tasks.filter(
        (t) => t.status === "review"
      ),
      completed: tasks.filter(
        (t) => t.status === "completed"
      ),
    });
  }, [tasks]);

  async function onDragEnd(result) {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const previousColumns = structuredClone(columns);

    const start = [...columns[source.droppableId]];
    const finish = [...columns[destination.droppableId]];

    const [moved] = start.splice(source.index, 1);

    moved.status = destination.droppableId;

    finish.splice(destination.index, 0, moved);

    const optimisticState = {
      ...columns,
      [source.droppableId]: start,
      [destination.droppableId]: finish,
    };

    setColumns(optimisticState);

    try {
      await axios.put(
        `${API}/tasks/status/${moved._id}`,
        {
          status: destination.droppableId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.log(err);

      setColumns(previousColumns);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-6 xl:grid-cols-4">

        <TaskColumn
          id="todo"
          title="Todo"
          tasks={columns.todo}
          onTaskClick={onTaskClick}
        />

        <TaskColumn
          id="in-progress"
          title="In Progress"
          tasks={columns["in-progress"]}
          onTaskClick={onTaskClick}
        />

        <TaskColumn
          id="review"
          title="Review"
          tasks={columns.review}
          onTaskClick={onTaskClick}
        />

        <TaskColumn
          id="completed"
          title="Completed"
          tasks={columns.completed}
          onTaskClick={onTaskClick}
        />

      </div>
    </DragDropContext>
  );
}

export default KanbanBoard;