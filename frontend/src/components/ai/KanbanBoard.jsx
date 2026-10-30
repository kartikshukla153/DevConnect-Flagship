
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

import axios from "axios";
import TaskCard from "./TaskCard";

const API = "http://localhost:5000/api";

const COLUMNS = [
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

export default function KanbanBoard({
  tasks = [],
  refreshWorkspace,
}) {
  const token = localStorage.getItem("token");

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // Ignore drops outside a column or drops that change nothing.
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;

    try {
      await axios.put(
        `${API}/tasks/status/${draggableId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await refreshWorkspace();
    } catch (error) {
      console.error(
        "Failed to update task status:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: 16,
          alignItems: "start",
          width: "100%",
        }}
      >
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter(
            (task) => task.status === column.status
          );

          return (
            <Droppable
              droppableId={column.status}
              key={column.status}
            >
              {(provided, snapshot) => (
                <div
                  style={{
                    background: "#111827",
                    border: `1px solid ${
                      snapshot.isDraggingOver
                        ? column.color
                        : "#263244"
                    }`,
                    borderRadius: 14,
                    padding: 12,
                    minHeight: 550,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignSelf: "start",
                    transition: "border-color 150ms ease",
                  }}
                >
                  {/* Column header */}
                  <div
                    style={{
                      background: column.color,
                      padding: "11px 10px",
                      color: "#ffffff",
                      borderRadius: 10,
                      marginBottom: 14,
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    <div>{column.title}</div>

                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        opacity: 0.85,
                        marginTop: 4,
                      }}
                    >
                      {columnTasks.length}{" "}
                      {columnTasks.length === 1
                        ? "task"
                        : "tasks"}
                    </div>
                  </div>

                  {/* Independently scrollable task area */}
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      minHeight: 400,
                      maxHeight: 620,
                      overflowY: "auto",
                      overflowX: "hidden",
                      padding: "2px 4px 8px 0",
                      scrollbarWidth: "thin",
                      scrollbarColor: "#475569 #111827",
                      borderRadius: 8,
                      background: snapshot.isDraggingOver
                        ? "rgba(255,255,255,0.025)"
                        : "transparent",
                      transition: "background 150ms ease",
                    }}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={String(task._id)}
                        index={index}
                      >
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            style={{
                              ...dragProvided.draggableProps.style,
                              opacity: dragSnapshot.isDragging
                                ? 0.9
                                : 1,
                              cursor: dragSnapshot.isDragging
                                ? "grabbing"
                                : "grab",
                            }}
                          >
                            <TaskCard
                              task={task}
                              refreshWorkspace={refreshWorkspace}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                    {columnTasks.length === 0 && (
                      <div
                        style={{
                          border: "1px dashed #374151",
                          borderRadius: 10,
                          padding: "24px 10px",
                          textAlign: "center",
                          color: "#9ca3af",
                          fontSize: 12,
                          lineHeight: 1.6,
                        }}
                      >
                        Drop tasks here
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}
