import TeamMembersPanel from "./TeamMembersPanel";
import ProjectChat from "./ProjectChat";

function WorkspaceRightSidebar({
  project,
  reloadWorkspace,
}) {
  return (
    <div className="space-y-6">

      <TeamMembersPanel
        project={project}
        reloadWorkspace={reloadWorkspace}
      />

      <div className="h-[520px]">

        <ProjectChat
          projectId={project._id}
        />

      </div>

    </div>
  );
}

export default WorkspaceRightSidebar;