import {
  ArrowRight,
  TrendingUp,
  Users,
  FolderKanban,
  Sparkles,
} from "lucide-react";

const skills = [
  "React",
  "Next.js",
  "Node.js",
  "TypeScript",
  "Docker",
  "Redis",
  "AI",
  "System Design",
];

const developers = [
  {
    name: "Sarah Johnson",
    role: "Frontend Engineer",
  },
  {
    name: "Alex Chen",
    role: "Backend Engineer",
  },
  {
    name: "Priya Sharma",
    role: "Full Stack Developer",
  },
];

const projects = [
  {
    title: "AI Code Review",
    members: 8,
  },
  {
    title: "DevConnect Mobile",
    members: 5,
  },
];

function FeedRightSidebar() {
  return (
    <div className="space-y-6">

      {/* Trending */}

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">

        <div className="mb-6 flex items-center gap-3">

          <TrendingUp
            size={20}
            className="text-cyan-400"
          />

          <h2 className="text-lg font-bold text-white">
            Trending Technologies
          </h2>

        </div>

        <div className="flex flex-wrap gap-3">

          {skills.map((skill) => (
            <button
              key={skill}
              className="rounded-full border border-white/10 bg-[#0B1220] px-4 py-2 text-sm text-slate-300 transition-all duration-200 hover:border-cyan-500 hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              #{skill}
            </button>
          ))}

        </div>

      </section>

      {/* Developers */}

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">

        <div className="mb-6 flex items-center gap-3">

          <Users
            size={20}
            className="text-cyan-400"
          />

          <h2 className="text-lg font-bold text-white">
            Suggested Developers
          </h2>

        </div>

        <div className="space-y-4">

          {developers.map((developer) => (

            <div
              key={developer.name}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-500/40"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 font-bold text-[#07131E]">
                  {developer.name.charAt(0)}
                </div>

                <div>

                  <h3 className="font-medium text-white">
                    {developer.name}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {developer.role}
                  </p>

                </div>

              </div>

              <button className="rounded-xl border border-white/10 p-2 transition hover:border-cyan-500 hover:bg-cyan-500/10">
                <ArrowRight
                  size={16}
                  className="text-cyan-400"
                />
              </button>

            </div>

          ))}

        </div>

      </section>

      {/* Active Projects */}

      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6">

        <div className="mb-6 flex items-center gap-3">

          <FolderKanban
            size={20}
            className="text-cyan-400"
          />

          <h2 className="text-lg font-bold text-white">
            Active Projects
          </h2>

        </div>

        <div className="space-y-4">

          {projects.map((project) => (

            <div
              key={project.title}
              className="rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-500/40"
            >

              <h3 className="font-semibold text-white">
                {project.title}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {project.members} developers collaborating
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Tip */}

      <section className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-sky-500/10 to-indigo-500/10 p-6">

        <div className="flex items-center gap-3">

          <Sparkles
            size={20}
            className="text-cyan-400"
          />

          <h2 className="text-lg font-bold text-white">
            Recruiter Insight
          </h2>

        </div>

        <p className="mt-5 text-sm leading-7 text-slate-300">
          Recruiters notice projects that demonstrate
          consistent collaboration, thoughtful UI,
          real-world architecture, and polished user
          experience—not just CRUD functionality.
        </p>

      </section>

    </div>
  );
}

export default FeedRightSidebar;