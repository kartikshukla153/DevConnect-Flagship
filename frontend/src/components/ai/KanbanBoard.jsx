import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import axios from "axios";
import TaskCard from "./TaskCard";

const API = "http://localhost:5000/api";

export default function KanbanBoard({
  tasks,
  refreshWorkspace,
}) {
  const token = localStorage.getItem("token");

  const columns = [
    {
      title: "Todo",
      status: "todo",
      color: "#374151",
    },
    {
      title: "In Progress",
      status: "in-progress",
      color: "#2563eb",
    },
    {
      title: "Review",
      status: "review",
      color: "#ca8a04",
    },
    {
      title: "Completed",
      status: "completed",
      color: "#16a34a",
    },
  ];

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;

    try {
      await axios.put(
        `${API}/tasks/status/${taskId}`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await refreshWorkspace();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20,
        }}
      >
        {columns.map((column) => (
          <Droppable
            droppableId={column.status}
            key={column.status}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  background: "#111827",
                  borderRadius: 14,
                  padding: 15,
                  minHeight: 550,
                }}
              >
                <div
                  style={{
                    background: column.color,
                    padding: 10,
                    color: "white",
                    borderRadius: 10,
                    marginBottom: 15,
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  {column.title}
                </div>

                {tasks
                  .filter(
                    (t) =>
                      t.status === column.status
                  )
                  .map((task, index) => (
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
                          <TaskCard
                            task={task}
                            refreshWorkspace={
                              refreshWorkspace
                            }
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}