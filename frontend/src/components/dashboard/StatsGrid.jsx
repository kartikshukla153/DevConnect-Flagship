import {
  FolderKanban,
  Users,
  MessageSquare,
  Bell,
  ArrowUpRight,
} from "lucide-react";

const icons = {
  Projects: FolderKanban,
  Connections: Users,
  Messages: MessageSquare,
  Notifications: Bell,
};

function StatsGrid({ stats = [] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = icons[stat.title] || FolderKanban;

        const value =
          typeof stat.value === "number"
            ? stat.value.toLocaleString()
            : stat.value ?? "0";

        return (
          <div
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#111827] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_16px_40px_rgba(34,211,238,0.07)]"
          >
            {/* Subtle ambient glow */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/10 bg-cyan-500/10">
                  <Icon
                    size={20}
                    className="text-cyan-400"
                  />
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-slate-600 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-400"
                />
              </div>

              {/* Value */}
              <div className="mt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {stat.title}
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-black tracking-tight text-white">
                    {value}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default StatsGrid;