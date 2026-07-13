import ProjectHeader from "./ProjectHeader";
import StatsCard from "./StatsCard";
import TechStack from "./TechStack";
import MilestoneCard from "./MilestoneCard";

function Workspace({ workspace }) {
  return (
    <div
      style={{
        marginTop: 40,
      }}
    >
      <ProjectHeader project={workspace.project} />

      <div
        style={{
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 30,
        }}
      >
        <StatsCard
          title="Progress"
          value={`${workspace.stats.progress}%`}
          color="#22c55e"
        />

        <StatsCard
          title="Tasks"
          value={workspace.stats.totalTasks}
          color="#3b82f6"
        />

        <StatsCard
          title="Completed"
          value={workspace.stats.completedTasks}
          color="#f59e0b"
        />
      </div>

      <h2 style={{ color: "white" }}>
        Tech Stack
      </h2>

      <TechStack techStack={workspace.techStack} />

      <h2
        style={{
          color: "white",
          marginBottom: 20,
        }}
      >
        Milestones
      </h2>

      {workspace.milestones.map((milestone) => (
        <MilestoneCard
          key={milestone.title}
          milestone={milestone}
        />
      ))}
    </div>
  );
}

export default Workspace;