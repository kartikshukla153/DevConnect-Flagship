import {
  ArrowUpRight,
  Clock3,
  FolderKanban,
  Users,
} from "lucide-react";

const demoProjects = [
  {
    id: 1,
    title: "DevConnect",
    description:
      "Developer collaboration platform with real-time chat, AI tools, project management and networking.",
    progress: 82,
    updated: "2 hours ago",
    members: 5,
    tech: [
      "React",
      "Node",
      "Socket.io",
      "MongoDB",
    ],
  },
  {
    id: 2,
    title: "Furniture Store",
    description:
      "Full Stack MERN ecommerce application with JWT authentication, payments and admin dashboard.",
    progress: 100,
    updated: "3 days ago",
    members: 2,
    tech: [
      "React",
      "Express",
      "MongoDB",
      "JWT",
    ],
  },
];

function FeaturedProjects({
  projects = demoProjects,
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Featured Projects
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Projects that best represent your engineering work.
          </p>

        </div>

      </div>

      <div className="space-y-6">
              {projects.map((project) => (
          <article
            key={project.id || project._id}
            className="group rounded-2xl border border-white/10 bg-[#0B1220] p-6 transition-all duration-300 hover:border-cyan-400/30"
          >
            <div className="flex items-start justify-between gap-6">

              <div className="flex flex-1 gap-5">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
                  <FolderKanban
                    size={24}
                    className="text-cyan-400"
                  />
                </div>

                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-3">

                    <h3 className="text-xl font-semibold text-white">
                      {project.title}
                    </h3>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                      Active
                    </span>

                  </div>

                  <p className="mt-4 max-w-3xl leading-7 text-slate-400">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">

                    {project.tech?.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg border border-cyan-500/15 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
                      >
                        {tech}
                      </span>
                    ))}

                  </div>

                  <div className="mt-6">

                    <div className="mb-2 flex items-center justify-between text-sm">

                      <span className="text-slate-400">
                        Progress
                      </span>

                      <span className="font-semibold text-white">
                        {project.progress}%
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">

                      <div
                        className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                        style={{
                          width: `${project.progress}%`,
                        }}
                      />

                    </div>

                  </div>

                </div>

              </div>

              <button className="rounded-xl border border-white/10 p-3 text-slate-500 transition hover:border-cyan-400/30 hover:text-cyan-300">
                <ArrowUpRight size={18} />
              </button>

            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between border-t border-white/10 pt-5">

              <div className="flex flex-wrap items-center gap-6">

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users size={16} />
                  {project.members} Members
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock3 size={16} />
                  Updated {project.updated}
                </div>

              </div>

              <button className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-cyan-300">
                Open Workspace
              </button>

            </div>

          </article>
        ))}
              </div>

      <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">

        <div>

          <p className="text-sm text-slate-500">
            Showcase your best engineering work here. Recruiters usually spend
            the most time looking at featured projects.
          </p>

        </div>

        <button
          className="
            rounded-xl
            border
            border-white/10
            bg-white/5
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition-all
            duration-200
            hover:border-cyan-400/30
            hover:bg-cyan-500/10
          "
        >
          View All Projects
        </button>

      </div>

    </section>
  );
}

export default FeaturedProjects;