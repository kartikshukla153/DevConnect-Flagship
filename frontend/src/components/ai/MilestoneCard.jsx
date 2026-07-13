import TaskCard from "./TaskCard";

function MilestoneCard({
  milestone,
  refreshWorkspace,
}) {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: 15,
        padding: 20,
        marginBottom: 25,
      }}
    >
      <h2
        style={{
          color: "white",
          marginBottom: 20,
        }}
      >
        {milestone.title}
      </h2>

      {milestone.tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          refreshWorkspace={refreshWorkspace}
        />
      ))}
    </div>
  );
}

export default MilestoneCard;