import {
  FolderKanban,
  Users,
  CalendarDays,
  Sparkles,
  GitBranch,
  Clock3,
  Activity,
  ArrowUpRight,
} from "lucide-react";

function WorkspaceHeader({
  project = {
    title: "DevConnect",
    description:
      "Production-grade developer collaboration platform built with the MERN stack.",
    members: [],
    updatedAt: new Date(),
    status: "In Progress",
    techStack: ["React", "Node", "MongoDB"],
  },
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111827]">

      {/* Gradient Banner */}

      <div className="relative h-52 overflow-hidden bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%)]" />

        <div className="absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

      </div>

      <div className="relative px-10 pb-10">

        <div className="-mt-16 flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">

          {/* Left */}

          <div className="flex gap-6">

            <div className="flex h-28 w-28 items-center justify-center rounded-[28px] border-4 border-[#111827] bg-white text-cyan-600 shadow-2xl">

              <FolderKanban size={48} />

            </div>

            <div className="pt-8">

              <div className="mb-3 flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-cyan-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  {project.status}
                </span>

                <span className="rounded-full bg-emerald-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                  Active Workspace
                </span>

              </div>

              <h1 className="text-4xl font-bold text-white">
                {project.title}
              </h1>

              <p className="mt-4 max-w-4xl leading-8 text-gray-300">
                {project.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-6 text-sm text-gray-400">

                <div className="flex items-center gap-2">
                  <Users size={16} />
                  {project.members?.length || 1} Members
                </div>

                <div className="flex items-center gap-2">
                  <GitBranch size={16} />
                  {project.techStack?.length || 0} Technologies
                </div>

                <div className="flex items-center gap-2">
                  <Clock3 size={16} />
                  Updated{" "}
                  {new Date(project.updatedAt).toLocaleDateString()}
                </div>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">

              <div className="mb-3 flex items-center justify-between">

                <Activity className="text-cyan-400" />

                <ArrowUpRight size={18} className="text-cyan-400" />

              </div>

              <p className="text-3xl font-bold text-white">
                86%
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Workspace Progress
              </p>

            </div>

            <button className="rounded-2xl bg-cyan-400 p-6 text-left text-black transition duration-300 hover:scale-[1.03] hover:bg-cyan-300">

              <Sparkles size={28} />

              <h3 className="mt-6 text-lg font-bold">
                AI Architect
              </h3>

              <p className="mt-2 text-sm opacity-80">
                Review code, generate docs, summarize discussions and plan architecture.
              </p>

            </button>

          </div>

        </div>

      </div>

    </section>
  );
}

export default WorkspaceHeader;