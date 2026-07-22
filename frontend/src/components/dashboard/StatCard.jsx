import { ArrowUpRight } from "lucide-react";

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  subtitle,
}) {
  return (
    <div
      className="
        group relative overflow-hidden rounded-3xl
        border border-white/10
        bg-[#111827]
        p-6
        transition-all duration-300
        hover:-translate-y-1
        hover:border-cyan-400/40
        hover:shadow-[0_20px_60px_rgba(6,182,212,0.08)]
      "
    >
      {/* Glow */}

      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">
            {title}
          </p>

          <h2 className="mt-4 text-5xl font-black tracking-tight text-white transition-transform duration-300 group-hover:scale-[1.02]">
            {value}
          </h2>

          <div className="mt-5 flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
              <ArrowUpRight size={12} />
              {change}
            </div>

            <span className="text-xs text-slate-500">
              {subtitle}
            </span>
          </div>
        </div>

        <div
          className="
            rounded-2xl
            border border-cyan-500/10
            bg-cyan-500/10
            p-4
            transition-all duration-300
            group-hover:scale-110
            group-hover:rotate-6
            group-hover:bg-cyan-500/20
          "
        >
          <Icon
            size={28}
            className="text-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}

export default StatCard;