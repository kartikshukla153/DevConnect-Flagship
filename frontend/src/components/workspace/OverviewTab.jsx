import {
  FolderKanban,
  Users,
  Clock3,
  CheckCircle2,
} from "lucide-react";

function OverviewTab({
  project = {
    description:
      "No description available.",
    members: [],
    tasks: [],
  },
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">

      <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

        <h2 className="mb-6 text-xl font-bold">
          Project Overview
        </h2>

        <p className="leading-8 text-gray-300">
          {project.description}
        </p>

      </section>

      <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

        <h2 className="mb-6 text-xl font-bold">
          Project Statistics
        </h2>

        <div className="space-y-5">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <FolderKanban size={18} />

              Projects

            </div>

            <span>1</span>

          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Users size={18} />

              Members

            </div>

            <span>{project.members?.length || 1}</span>

          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <Clock3 size={18} />

              Tasks

            </div>

            <span>{project.tasks?.length || 0}</span>

          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">

              <CheckCircle2 size={18} />

              Completed

            </div>

            <span>
              {
                project.tasks?.filter(
                  (t) => t.completed
                ).length
              }
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default OverviewTab;