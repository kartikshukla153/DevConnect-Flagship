function TaskCard({ task }) {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: 14,
        borderRadius: 10,
        marginBottom: 10,
        border: "1px solid #334155",
      }}
    >
      <div
        style={{
          color: "white",
          fontWeight: 600,
        }}
      >
        {task.title}
      </div>

      <div
        style={{
          color: "#94a3b8",
          marginTop: 6,
        }}
      >
        {task.status}
      </div>
    </div>
  );
}

export default TaskCard;