import {
  ArrowUpRight,
  Clock3,
  FolderKanban,
  Users,
} from "lucide-react";

function RecentProjects({ projects = [] }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Active Projects
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Pick up where you left off and continue collaborating with your
            team.
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="flex h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0B1220]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10">
            <FolderKanban
              size={30}
              className="text-cyan-400"
            />
          </div>

          <h3 className="mt-6 text-xl font-semibold text-white">
            No Active Projects
          </h3>

          <p className="mt-3 max-w-md text-center text-sm leading-7 text-slate-400">
            Start a collaborative project, invite developers and manage
            everything from one workspace.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_18px_50px_rgba(34,211,238,0.08)]"
            >
              {/* Glow */}

              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">
                {/* Top */}

                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">
                        {project.title}
                      </h3>

                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Active
                      </span>
                    </div>

                    <p className="mt-4 max-w-3xl leading-7 text-slate-400">
                      {project.description}
                    </p>
                  </div>

                  <ArrowUpRight
                    size={20}
                    className="text-slate-500 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-cyan-400"
                  />
                </div>

                {/* Tech */}

                {project.techStack?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-xl border border-cyan-500/15 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress */}

                <div className="mt-7">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Project Progress
                    </span>

                    <span className="font-semibold text-white">
                      {project.progress ?? 72}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-700"
                      style={{
                        width: `${project.progress ?? 72}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}

                <div className="mt-7 flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6">
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users size={17} />

                      <span className="text-sm">
                        {project.members?.length || 1} Members
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock3 size={17} />

                      <span className="text-sm">
                        Updated 2 hours ago
                      </span>
                    </div>
                  </div>

                  <button className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10">
                    Open Workspace
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentProjects;