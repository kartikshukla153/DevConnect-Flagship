import {
  CheckCircle2,
  Clock3,
  ClipboardList,
  Users,
} from "lucide-react";

function StatCard({
  icon,
  title,
  value,
  color,
}) {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6 transition duration-300 hover:border-cyan-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>
        </div>

        <div
          className={`rounded-2xl p-4 ${color}`}
        >
          {icon}
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
    (t) => t.status === "completed"
  ).length;

  const inProgress = safeTasks.filter(
    (t) => t.status === "in-progress"
  ).length;

  const progress =
    total === 0
      ? 0
      : Math.round(
          (completed / total) * 100
        );

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={total}
          icon={<ClipboardList />}
          color="bg-cyan-500/10 text-cyan-400"
        />

        <StatCard
          title="Completed"
          value={completed}
          icon={<CheckCircle2 />}
          color="bg-green-500/10 text-green-400"
        />

        <StatCard
          title="In Progress"
          value={inProgress}
          icon={<Clock3 />}
          color="bg-yellow-500/10 text-yellow-400"
        />

        <StatCard
          title="Members"
          value={project?.members?.length || 0}
          icon={<Users />}
          color="bg-purple-500/10 text-purple-400"
        />
      </div>

      <div className="mt-6 rounded-3xl border border-[#263243] bg-[#111827] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">
            Project Progress
          </h2>

          <span className="font-bold text-cyan-400">
            {progress}%
          </span>
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
    </>
  );
}

export default WorkspaceStats;