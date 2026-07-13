function ProgressCard({ stats }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        padding: 25,
        borderRadius: 15,
        marginBottom: 30,
      }}
    >
      <h2>Project Progress</h2>

      <h1>{stats.progress}%</h1>

      <p>
        {stats.completedTasks} / {stats.totalTasks} Tasks Completed
      </p>

      <div
        style={{
          width: "100%",
          height: 14,
          background: "#ddd",
          borderRadius: 20,
        }}
      >
        <div
          style={{
            width: `${stats.progress}%`,
            height: "100%",
            background: "#22c55e",
            borderRadius: 20,
          }}
        />
      </div>
    </div>
  );
}

export default ProgressCard;