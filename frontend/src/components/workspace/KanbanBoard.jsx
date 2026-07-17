import { DragDropContext } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import axios from "axios";

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
      todo: tasks.filter((task) => task.status === "todo"),

      "in-progress": tasks.filter(
        (task) => task.status === "in-progress"
      ),

      review: tasks.filter(
        (task) => task.status === "review"
      ),

      completed: tasks.filter(
        (task) => task.status === "completed"
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

    const sourceColumn = [
      ...columns[source.droppableId],
    ];

    const destinationColumn = [
      ...columns[destination.droppableId],
    ];

    const [movedTask] = sourceColumn.splice(
      source.index,
      1
    );

    movedTask.status = destination.droppableId;

    destinationColumn.splice(
      destination.index,
      0,
      movedTask
    );

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]:
        destinationColumn,
    });

    try {
      await axios.put(
        `${API}/tasks/status/${movedTask._id}`,
        {
          status: destination.droppableId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      reloadTasks();
    } catch (error) {
      console.log(error);

      reloadTasks();
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