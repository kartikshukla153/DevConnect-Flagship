import { Activity, CheckCircle2, ListTodo, TrendingUp } from "lucide-react";

const ICONS = {
  Progress: TrendingUp,
  "Total tasks": ListTodo,
  Tasks: ListTodo,
  "In progress": Activity,
  Completed: CheckCircle2,
};

export default function StatsCard({ title, value, color = "#22d3ee" }) {
  const Icon = ICONS[title] || Activity;

  return (
    <article className="rounded-xl border border-white/[0.07] bg-[#111C2B] p-4 transition-colors hover:border-white/[0.12] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04]" style={{ color }}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white tabular-nums sm:text-3xl">{value}</p>
    </article>
  );
}
