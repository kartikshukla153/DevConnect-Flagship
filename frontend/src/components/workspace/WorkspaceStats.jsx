import {
  CheckCircle2,
  Clock3,
  ClipboardList,
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  BarChart3,
} from "lucide-react";

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  color,
  progress,
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#111827] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_18px_45px_rgba(34,211,238,0.08)]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition duration-500 group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-400">
              {title}
            </p>

            <h2 className="mt-2 text-4xl font-bold text-white">
              {value}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              {subtitle}
            </p>
          </div>

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color}`}
          >
            {icon}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-500">
              Progress
            </span>

            <span className="font-semibold text-cyan-300">
              {progress}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-700"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceStats({
  tasks = [],
  project = {},
}) {
  const safeTasks = Array.isArray(tasks)
    ? tasks
    : [];

  const total = safeTasks.length;

  const completed = safeTasks.filter(
    (task) => task.status === "completed"
  ).length;

  const inProgress = safeTasks.filter(
    (task) =>
      task.status === "in-progress"
  ).length;

  const todo = safeTasks.filter(
    (task) => task.status === "todo"
  ).length;

  const overdue = safeTasks.filter((task) => {
    if (!task.deadline) return false;

    return (
      new Date(task.deadline) <
        new Date() &&
      task.status !== "completed"
    );
  }).length;

  const completion =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  const productivity =
    total === 0
      ? 0
      : Math.min(
          100,
          completion +
            Math.round(
              inProgress * 3
            )
        );

  return (
    <div className="space-y-6">

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="Total Tasks"
          value={total}
          subtitle="Across workspace"
          progress={100}
          color="bg-cyan-500/10 text-cyan-400"
          icon={<ClipboardList size={24} />}
        />

        <MetricCard
          title="Completed"
          value={completed}
          subtitle="Successfully finished"
          progress={completion}
          color="bg-green-500/10 text-green-400"
          icon={<CheckCircle2 size={24} />}
        />

        <MetricCard
          title="In Progress"
          value={inProgress}
          subtitle="Currently active"
          progress={
            total
              ? Math.round(
                  (inProgress / total) *
                    100
                )
              : 0
          }
          color="bg-yellow-500/10 text-yellow-400"
          icon={<Clock3 size={24} />}
        />

        <MetricCard
          title="Members"
          value={
            project?.members?.length || 0
          }
          subtitle="Project collaborators"
          progress={productivity}
          color="bg-purple-500/10 text-purple-400"
          icon={<Users size={24} />}
        />

      </div>

      <div className="grid gap-6 xl:grid-cols-3">

        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-[#111827] p-8">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase tracking-widest text-cyan-400">
                Workspace Analytics
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                Project Progress
              </h2>

            </div>

            <BarChart3
              className="text-cyan-400"
              size={30}
            />

          </div>

          <div className="mt-10">

            <div className="mb-3 flex justify-between">

              <span className="text-slate-400">
                Completion Rate
              </span>

              <span className="font-bold text-white">
                {completion}%
              </span>

            </div>

            <div className="h-4 overflow-hidden rounded-full bg-white/5">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 transition-all duration-700"
                style={{
                  width: `${completion}%`,
                }}
              />

            </div>

          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-5">

              <Target className="mb-3 text-cyan-400" />

              <p className="text-sm text-slate-400">
                Todo
              </p>

              <h3 className="mt-2 text-3xl font-bold text-white">
                {todo}
              </h3>

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-5">

              <TrendingUp className="mb-3 text-green-400" />

              <p className="text-sm text-slate-400">
                Productivity
              </p>

              <h3 className="mt-2 text-3xl font-bold text-white">
                {productivity}%
              </h3>

            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-5">

              <AlertTriangle className="mb-3 text-red-400" />

              <p className="text-sm text-slate-400">
                Overdue
              </p>

              <h3 className="mt-2 text-3xl font-bold text-white">
                {overdue}
              </h3>

            </div>

          </div>

        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">

          <p className="text-sm uppercase tracking-widest text-cyan-400">
            Workspace Health
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            Overview
          </h2>

          <div className="mt-8 space-y-6">

            <div>

              <div className="mb-2 flex justify-between">

                <span className="text-slate-400">
                  Completion
                </span>

                <span className="font-semibold text-white">
                  {completion}%
                </span>

              </div>

              <div className="h-2 rounded-full bg-white/5">

                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width: `${completion}%`,
                  }}
                />

              </div>

            </div>

            <div>

              <div className="mb-2 flex justify-between">

                <span className="text-slate-400">
                  Productivity
                </span>

                <span className="font-semibold text-white">
                  {productivity}%
                </span>

              </div>

              <div className="h-2 rounded-full bg-white/5">

                <div
                  className="h-full rounded-full bg-green-400"
                  style={{
                    width: `${productivity}%`,
                  }}
                />

              </div>

            </div>

          </div>

          <div className="mt-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">

            <p className="text-sm leading-7 text-slate-300">
              Healthy engineering teams maintain a high completion
              rate while keeping overdue work to a minimum. These
              metrics give recruiters an instant overview of the
              project's execution.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default WorkspaceStats;