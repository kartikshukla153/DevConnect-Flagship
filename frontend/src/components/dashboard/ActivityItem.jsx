import {
  ArrowUpRight,
  Clock3,
} from "lucide-react";

function ActivityItem({
  activity,
  isLast,
}) {
  return (
    <div className="group flex gap-5">
      {/* Timeline */}

      <div className="flex flex-col items-center">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-cyan-500/20">
          <img
            src={
              activity.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                activity.user || "Dev"
              )}&background=0f172a&color=22d3ee`
            }
            alt={activity.user}
            className="h-10 w-10 rounded-full object-cover"
          />
        </div>

        {!isLast && (
          <div className="mt-2 h-full w-px bg-gradient-to-b from-cyan-500/40 to-transparent" />
        )}
      </div>

      {/* Card */}

      <div className="flex-1 rounded-2xl border border-white/10 bg-[#0B1220] p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-400/30 group-hover:shadow-[0_12px_40px_rgba(34,211,238,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-white">
                {activity.title}
              </h3>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-cyan-300">
                {activity.type || "Activity"}
              </span>
            </div>

            <p className="mt-3 leading-7 text-slate-400">
              {activity.description}
            </p>
          </div>

          <ArrowUpRight
            size={18}
            className="text-slate-500 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          <Clock3 size={14} />

          <span>{activity.time}</span>
        </div>
      </div>
    </div>
  );
}

export default ActivityItem;