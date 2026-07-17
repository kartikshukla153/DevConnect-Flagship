import {
  FolderKanban,
  Users,
  ArrowRight,
} from "lucide-react";

function RecentProjects({ projects = [] }) {
  return (
    <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Recent Projects
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Continue working on your latest collaborations.
          </p>

        </div>

      </div>

      {projects.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#263243]">

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">

            <FolderKanban
              size={28}
              className="text-cyan-400"
            />

          </div>

          <h3 className="mt-6 text-lg font-semibold text-white">
            No Projects Yet
          </h3>

          <p className="mt-2 max-w-md text-center text-sm leading-7 text-gray-400">
            Create your first collaborative project and invite developers to
            start building together.
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {projects.map((project) => (

            <div
              key={project._id}
              className="group rounded-2xl border border-[#263243] bg-[#0B1220] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/10"
            >

              <div className="flex items-start justify-between">

                <div>

                  <h3 className="text-lg font-semibold text-white">
                    {project.title}
                  </h3>

                  <p className="mt-3 leading-7 text-gray-400">
                    {project.description}
                  </p>

                </div>

                <ArrowRight
                  size={18}
                  className="text-gray-500 transition group-hover:translate-x-1 group-hover:text-cyan-400"
                />

              </div>

              <div className="mt-6 flex flex-wrap gap-3">

                {project.techStack?.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300"
                  >
                    {tech}
                  </span>
                ))}

              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#263243] pt-5">

                <div className="flex items-center gap-2 text-gray-400">

                  <Users size={18} />

                  <span>
                    {project.members?.length || 1} Members
                  </span>

                </div>

                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-400">
                  Active
                </span>

              </div>

            </div>

          ))}

        </div>
      )}

    </section>
  );
}

export default RecentProjects;