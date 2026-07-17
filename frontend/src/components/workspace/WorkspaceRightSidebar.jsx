import { Users } from "lucide-react";
import ProjectChat from "./ProjectChat";

function WorkspaceRightSidebar({
  project,
}) {
  return (
    <div className="space-y-6">

      {/* Online Members */}

      <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

        <div className="mb-5 flex items-center gap-3">

          <Users
            size={18}
            className="text-cyan-400"
          />

          <h2 className="font-semibold">
            Team
          </h2>

        </div>

        <div className="space-y-4">

          {project.members?.map((member) => (
            <div
              key={member.user?._id}
              className="flex items-center justify-between"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">

                  {member.user?.name?.charAt(0)}

                </div>

                <div>

                  <p className="font-medium">

                    {member.user?.name}

                  </p>

                  <p className="text-xs text-gray-500">

                    {member.role}

                  </p>

                </div>

              </div>

              <div className="h-3 w-3 rounded-full bg-green-500" />

            </div>
          ))}

        </div>

      </div>

      {/* Chat */}

      <div className="h-[520px]">

        <ProjectChat
          projectId={project._id}
        />

      </div>

    </div>
  );
}

export default WorkspaceRightSidebar;