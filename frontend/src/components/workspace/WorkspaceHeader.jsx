import {
  FolderKanban,
  Users,
  CalendarDays,
  Sparkles,
  Plus,
} from "lucide-react";

function WorkspaceHeader({
  project,
  onCreateTask,
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#263243] bg-[#111827]">

      <div className="h-44 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600" />

      <div className="px-10 pb-10">

        <div className="-mt-14 flex flex-col justify-between gap-8 xl:flex-row">

          <div className="flex gap-6">

            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-[#111827] bg-cyan-400 text-black shadow-2xl">

              <FolderKanban size={44} />

            </div>

            <div className="pt-6">

              <h1 className="text-4xl font-bold text-white">
                {project.title}
              </h1>

              <p className="mt-4 max-w-3xl leading-7 text-gray-300">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-400">

                <div className="flex items-center gap-2">

                  <Users size={16} />

                  {project.members?.length || 0} Members

                </div>

                <div className="flex items-center gap-2">

                  <CalendarDays size={16} />

                  Updated{" "}
                  {new Date(
                    project.updatedAt
                  ).toLocaleDateString()}

                </div>

              </div>

            </div>

          </div>

          <div className="flex gap-4">

            <button
              onClick={onCreateTask}
              className="flex items-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-black transition hover:scale-105"
            >

              <Plus size={20} />

              Create Task

            </button>

            <button className="flex items-center gap-3 rounded-2xl border border-cyan-400 bg-cyan-500/10 px-6 py-4 font-semibold text-cyan-300 transition hover:bg-cyan-500/20">

              <Sparkles size={20} />

              AI Planner

            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default WorkspaceHeader;