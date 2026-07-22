import {
  FolderKanban,
  Users,
  CalendarDays,
  Sparkles,
  Plus,
  CheckCircle2,
  Share2,
  GitBranch,
  Activity,
  Target,
} from "lucide-react";

function WorkspaceHeader({
  project,
  tasks = [],
  onCreateTask,
}) {
  const completed = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completed / tasks.length) * 100
        );

  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-[#111827] shadow-2xl">

      {/* Premium Background */}

      <div className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-r from-[#07111F] via-[#0E2236] to-[#07111F]" />

        <div className="absolute -left-32 -top-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-sky-500/15 blur-[120px]" />

        <div className="relative px-10 py-9">

          <div className="flex flex-col justify-between gap-10 xl:flex-row">

            {/* LEFT */}

            <div className="flex gap-6">

              {/* Project Logo */}

              <div
                className="
                flex
                h-20
                w-20
                shrink-0
                items-center
                justify-center
                rounded-3xl
                bg-gradient-to-br
                from-cyan-400
                via-sky-400
                to-blue-500
                shadow-[0_20px_60px_rgba(34,211,238,.35)]
                "
              >
                <FolderKanban
                  size={34}
                  className="text-black"
                />
              </div>

              {/* Info */}

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-4xl font-bold tracking-tight text-white">
                    {project.title}
                  </h1>

                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Production
                  </span>

                  <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Active Sprint
                  </span>

                </div>

                <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-300">
                  {project.description}
                </p>

                {/* Quick Stats */}

                <div className="mt-6 flex flex-wrap gap-4">

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">

                    <div className="text-2xl font-bold text-white">
                      {tasks.length}
                    </div>

                    <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                      Tasks
                    </div>

                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">

                    <div className="text-2xl font-bold text-white">
                      {project.members?.length || 0}
                    </div>

                    <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                      Members
                    </div>

                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">

                    <div className="text-2xl font-bold text-emerald-400">
                      {progress}%
                    </div>

                    <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                      Completed
                    </div>

                  </div>

                </div>

                {/* Info Row */}

                <div className="mt-6 flex flex-wrap gap-8 text-sm text-slate-400">

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

                  <div className="flex items-center gap-2 text-emerald-400">

                    <CheckCircle2 size={16} />

                    {completed} Completed Tasks

                  </div>

                </div>
                                {/* Progress */}

                <div className="mt-8 max-w-2xl">

                  <div className="mb-3 flex items-center justify-between">

                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">

                      <Activity
                        size={16}
                        className="text-cyan-400"
                      />

                      Sprint Progress

                    </div>

                    <span className="text-sm font-semibold text-cyan-300">
                      {progress}%
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white/10">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div className="flex w-full max-w-sm flex-col gap-4">

              <button
                onClick={onCreateTask}
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-400
                  to-sky-500
                  px-6
                  py-4
                  font-semibold
                  text-black
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_20px_50px_rgba(34,211,238,.35)]
                "
              >
                <Plus size={20} />
                Create Task
              </button>

              <button
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border
                  border-cyan-500/30
                  bg-cyan-500/10
                  px-6
                  py-4
                  font-semibold
                  text-cyan-300
                  transition-all
                  hover:border-cyan-400
                  hover:bg-cyan-500/20
                "
              >
                <Sparkles size={19} />
                AI Assistant
              </button>

              <div className="grid grid-cols-2 gap-4">

                <button
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-4
                    text-sm
                    font-medium
                    text-white
                    transition-all
                    hover:border-cyan-400/30
                    hover:bg-cyan-500/10
                  "
                >
                  <Users size={18} />
                  Invite
                </button>

                <button
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    px-4
                    py-4
                    text-sm
                    font-medium
                    text-white
                    transition-all
                    hover:border-cyan-400/30
                    hover:bg-cyan-500/10
                  "
                >
                  <Share2 size={18} />
                  Share
                </button>

              </div>

              <button
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  px-6
                  py-4
                  text-white
                  transition-all
                  hover:border-white/20
                  hover:bg-white/10
                "
              >
                <GitBranch size={18} />
                Repository
              </button>

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-5
                  backdrop-blur-xl
                "
              >
                <div className="flex items-center gap-3">

                  <Target className="text-cyan-400" />

                  <div>

                    <p className="text-sm font-semibold text-white">
                      Current Sprint
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {completed} of {tasks.length} tasks completed.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

export default WorkspaceHeader;