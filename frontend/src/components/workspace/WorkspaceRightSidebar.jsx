import {
  Users,
  Target,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Circle,
} from "lucide-react";

function WorkspaceRightSidebar({
  project,
  reloadWorkspace,
}) {
  const members = project?.members || [];
  const tasks = project?.tasks || [];

  const completed = tasks.filter(
    (t) => t.status === "completed"
  ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completed / tasks.length) * 100
        );

  return (
    <div className="space-y-6">

      {/* Sprint Overview */}

      <section className="rounded-3xl border border-white/10 bg-[#111827] overflow-hidden">

        <div className="border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-transparent p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-black">

              <Target size={22} />

            </div>

            <div>

              <h2 className="font-bold text-lg">
                Sprint Overview
              </h2>

              <p className="text-sm text-slate-400">
                Current Progress
              </p>

            </div>

          </div>

        </div>

        <div className="p-6">

          <div className="mb-3 flex justify-between">

            <span className="text-slate-400">
              Completion
            </span>

            <span className="font-bold text-cyan-300">
              {progress}%
            </span>

          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[#0B1220]">

            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-700"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="rounded-2xl bg-[#0B1220] p-4">

              <Clock3
                className="mb-3 text-yellow-400"
                size={20}
              />

              <h3 className="text-2xl font-bold">
                {tasks.length}
              </h3>

              <p className="text-sm text-slate-500">
                Tasks
              </p>

            </div>

            <div className="rounded-2xl bg-[#0B1220] p-4">

              <CheckCircle2
                className="mb-3 text-green-400"
                size={20}
              />

              <h3 className="text-2xl font-bold">
                {completed}
              </h3>

              <p className="text-sm text-slate-500">
                Completed
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Team */}

      <section className="rounded-3xl border border-white/10 bg-[#111827]">

        <div className="flex items-center justify-between border-b border-white/10 p-5">

          <div className="flex items-center gap-3">

            <Users className="text-cyan-300" />

            <h2 className="font-semibold">
              Team Members
            </h2>

          </div>

          <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300">

            {members.length}

          </span>

        </div>

        <div className="space-y-3 p-5">

          {members.slice(0, 5).map((member) => (

            <div
              key={member.user?._id}
              className="flex items-center justify-between rounded-2xl bg-[#0B1220] p-4 transition hover:bg-[#101b2c]"
            >

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">

                  {member.user?.name?.charAt(0)}

                </div>

                <div>

                  <h3 className="font-medium">

                    {member.user?.name}

                  </h3>

                  <p className="text-xs text-slate-500">

                    {member.role}

                  </p>

                </div>

              </div>

              <Circle
                size={10}
                className="fill-green-400 text-green-400"
              />

            </div>

          ))}

        </div>

      </section>       {/* Upcoming Deadlines */}

      <section className="rounded-3xl border border-white/10 bg-[#111827]">

        <div className="border-b border-white/10 p-5">

          <div className="flex items-center gap-3">

            <Clock3 className="text-cyan-300" />

            <div>

              <h2 className="font-semibold">
                Upcoming Deadlines
              </h2>

              <p className="text-sm text-slate-500">
                Stay ahead of schedule
              </p>

            </div>

          </div>

        </div>

        <div className="space-y-3 p-5">

          {(tasks || [])
            .filter((t) => t.deadline)
            .sort(
              (a, b) =>
                new Date(a.deadline) -
                new Date(b.deadline)
            )
            .slice(0, 4)
            .map((task) => (
              <div
                key={task._id}
                className="rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-500/20"
              >

                <div className="flex items-center justify-between">

                  <h3 className="line-clamp-1 font-medium text-white">

                    {task.title}

                  </h3>

                  <span className="rounded-full bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-400">

                    Due

                  </span>

                </div>

                <p className="mt-2 text-xs text-slate-500">

                  {new Date(
                    task.deadline
                  ).toLocaleDateString()}

                </p>

              </div>
            ))}

          {tasks.filter((t) => t.deadline).length === 0 && (

            <div className="rounded-2xl bg-[#0B1220] p-8 text-center text-sm text-slate-500">

              No upcoming deadlines

            </div>

          )}

        </div>

      </section>

      {/* AI Insights */}

      <section className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-transparent">

        <div className="p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-black">

              <TrendingUp size={22} />

            </div>

            <div>

              <h2 className="font-bold text-lg">

                AI Workspace Insights

              </h2>

              <p className="text-sm text-cyan-200">

                Project Health Analysis

              </p>

            </div>

          </div>

          <div className="mt-6 space-y-4">

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

              <div className="flex gap-3">

                <CheckCircle2
                  size={18}
                  className="mt-1 text-green-400"
                />

                <p className="text-sm leading-7 text-slate-300">

                  Sprint progress is healthy.
                  Keep current development pace.

                </p>

              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

              <div className="flex gap-3">

                <Clock3
                  size={18}
                  className="mt-1 text-yellow-400"
                />

                <p className="text-sm leading-7 text-slate-300">

                  Review pending tasks before
                  creating new features.

                </p>

              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">

              <div className="flex gap-3">

                <Users
                  size={18}
                  className="mt-1 text-cyan-400"
                />

                <p className="text-sm leading-7 text-slate-300">

                  Team collaboration looks active.
                  Continue frequent updates.

                </p>

              </div>

            </div>

          </div>

        </div>

      </section>
            {/* Recent Activity */}

      <section className="rounded-3xl border border-white/10 bg-[#111827]">

        <div className="border-b border-white/10 p-5">

          <h2 className="text-lg font-semibold">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest workspace updates
          </p>

        </div>

        <div className="space-y-6 p-6">

          <div className="flex gap-4">

            <div className="mt-1 h-3 w-3 rounded-full bg-cyan-400" />

            <div>

              <h3 className="font-medium text-white">
                Sprint updated
              </h3>

              <p className="text-sm text-slate-500">
                Progress reached {progress}% completion.
              </p>

            </div>

          </div>

          <div className="flex gap-4">

            <div className="mt-1 h-3 w-3 rounded-full bg-green-400" />

            <div>

              <h3 className="font-medium text-white">
                Team Active
              </h3>

              <p className="text-sm text-slate-500">
                {members.length} members collaborating.
              </p>

            </div>

          </div>

          <div className="flex gap-4">

            <div className="mt-1 h-3 w-3 rounded-full bg-yellow-400" />

            <div>

              <h3 className="font-medium text-white">
                Kanban Updated
              </h3>

              <p className="text-sm text-slate-500">
                Drag & drop board synchronized.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Quick Actions */}

      <section className="rounded-3xl border border-white/10 bg-[#111827]">

        <div className="border-b border-white/10 p-5">

          <h2 className="text-lg font-semibold">
            Quick Actions
          </h2>

        </div>

        <div className="grid gap-3 p-5">

          <button
            className="
              rounded-2xl
              border
              border-cyan-500/20
              bg-cyan-500/10
              px-4
              py-4
              text-left
              font-medium
              text-cyan-300
              transition
              hover:bg-cyan-500/20
            "
          >
            + Invite Member
          </button>

          <button
            className="
              rounded-2xl
              border
              border-white/10
              bg-[#0B1220]
              px-4
              py-4
              text-left
              transition
              hover:border-cyan-500/20
            "
          >
            GitHub Repository
          </button>

          <button
            className="
              rounded-2xl
              border
              border-white/10
              bg-[#0B1220]
              px-4
              py-4
              text-left
              transition
              hover:border-cyan-500/20
            "
          >
            Generate Sprint Report
          </button>

          <button
            className="
              rounded-2xl
              border
              border-white/10
              bg-[#0B1220]
              px-4
              py-4
              text-left
              transition
              hover:border-cyan-500/20
            "
          >
            Project Settings
          </button>

        </div>

      </section>

    </div>
  );
}

export default WorkspaceRightSidebar;