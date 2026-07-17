import {
  ListTodo,
  Clock3,
  Eye,
  CheckCircle2,
} from "lucide-react";

function Stat({ icon, title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">

      <div className="mb-3">
        {icon}
      </div>

      <p className="text-sm text-gray-400">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold">
        {value}
      </h3>

    </div>
  );
}

function TaskStats({ tasks }) {
  const todo = tasks.filter(
    (t) => t.status === "todo"
  ).length;

  const progress = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;

  const review = tasks.filter(
    (t) => t.status === "review"
  ).length;

  const completed = tasks.filter(
    (t) => t.status === "completed"
  ).length;

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

      <Stat
        icon={<ListTodo className="text-cyan-400" />}
        title="Todo"
        value={todo}
      />

      <Stat
        icon={<Clock3 className="text-yellow-400" />}
        title="In Progress"
        value={progress}
      />

      <Stat
        icon={<Eye className="text-orange-400" />}
        title="Review"
        value={review}
      />

      <Stat
        icon={<CheckCircle2 className="text-green-400" />}
        title="Completed"
        value={completed}
      />

    </div>
  );
}

export default TaskStats;