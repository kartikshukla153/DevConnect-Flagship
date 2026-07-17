import {
  FolderKanban,
  Users,
  CalendarDays,
  Sparkles,
} from "lucide-react";

function WorkspaceHeader({
  project = {
    title: "DevConnect",
    description:
      "Production-grade developer collaboration platform built with the MERN stack.",
    members: [],
    updatedAt: new Date(),
  },
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-[#263243] bg-[#111827]">

      {/* Banner */}

      <div className="h-40 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600" />

      <div className="px-10 pb-10">

        <div className="-mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          <div className="flex gap-6">

            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#111827] bg-cyan-400 text-4xl font-bold text-black shadow-xl">
              <FolderKanban size={42} />
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

                  {project.members?.length || 1} Members

                </div>

                <div className="flex items-center gap-2">

                  <CalendarDays size={16} />

                  Updated{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}

                </div>

              </div>

            </div>

          </div>

          <button className="flex items-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-black transition hover:bg-cyan-300">

            <Sparkles size={20} />

            AI Architect

          </button>

        </div>

      </div>

    </section>
  );
}

export default WorkspaceHeader;