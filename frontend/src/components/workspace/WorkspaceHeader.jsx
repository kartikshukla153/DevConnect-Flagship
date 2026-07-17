import {
  FolderKanban,
  Users,
  CalendarDays,
  Sparkles,
  Plus,
  CheckCircle2,
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
    <section className="overflow-hidden rounded-3xl border border-[#263243] bg-[#111827] shadow-xl">

      {/* Banner */}

      <div className="relative h-48 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_45%)]" />

      </div>

      <div className="px-10 pb-10">

        <div className="-mt-14 flex flex-col justify-between gap-10 xl:flex-row">

          {/* Left */}

          <div className="flex gap-6">

            <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-[#111827] bg-cyan-400 text-black shadow-2xl">

              <FolderKanban size={44} />

            </div>

            <div className="pt-5">

              <h1 className="text-4xl font-bold tracking-tight text-white">

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

                <div className="flex items-center gap-2 text-green-400">

                  <CheckCircle2 size={16} />

                  {progress}% Completed

                </div>

              </div>

              {/* Progress */}

              <div className="mt-6 w-full max-w-xl">

                <div className="mb-2 flex justify-between text-xs text-gray-400">

                  <span>Project Progress</span>

                  <span>{progress}%</span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-[#0B1220]">

                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* Right */}

          <div className="flex items-start gap-4">

            <button
              onClick={onCreateTask}
              className="flex items-center gap-3 rounded-2xl bg-cyan-400 px-6 py-4 font-semibold text-black transition duration-300 hover:scale-105 hover:bg-cyan-300"
            >

              <Plus size={20} />

              Create Task

            </button>

            <button className="flex items-center gap-3 rounded-2xl border border-cyan-400 bg-cyan-500/10 px-6 py-4 font-semibold text-cyan-300 transition duration-300 hover:bg-cyan-500/20">

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