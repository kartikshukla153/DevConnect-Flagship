import ProjectChat from "./ProjectChat";
import OnlineMembers from "./OnlineMembers";
import WorkspaceStats from "./WorkspaceStats";
import ActivityFeed from "./ActivityFeed";

function WorkspaceRightSidebar({
  project,
}) {
  return (
    <div className="space-y-6">

      {/* Workspace Stats */}

      <WorkspaceStats />

      {/* Online Members */}

      <OnlineMembers
        project={project}
      />

      {/* Activity */}

      <ActivityFeed
        projectId={project._id}
      />

      {/* Team Chat */}

      <div className="h-[520px]">

        <ProjectChat
          projectId={project._id}
        />

      </div>

    </div>
  );
}

export default WorkspaceRightSidebar;