import { CalendarDays, Flame } from "lucide-react";

function ContributionHeatmap({ contributions = [] }) {
  const totalDays = 140;

  const cells = Array.from({ length: totalDays }, (_, index) => {
    return contributions[index] || 0;
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
  ];

  const getColor = (value) => {
    if (value >= 4)
      return "bg-cyan-400";

    if (value === 3)
      return "bg-cyan-500/80";

    if (value === 2)
      return "bg-cyan-500/60";

    if (value === 1)
      return "bg-cyan-500/30";

    return "bg-[#1B2636]";
  };

  const total = contributions.reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Contribution Activity
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Track your coding consistency, commits,
            project work and collaboration across
            DevConnect.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#0B1220] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Flame
                size={16}
                className="text-orange-400"
              />

              <span className="text-xs uppercase tracking-wider">
                Total
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-white">
              {total}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0B1220] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarDays
                size={16}
                className="text-cyan-400"
              />

              <span className="text-xs uppercase tracking-wider">
                Days
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-white">
              {totalDays}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="mb-4 flex justify-between px-1 text-xs font-medium tracking-wide text-slate-500">
            {months.map((month) => (
              <span key={month}>
                {month}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-20 gap-2">
            {cells.map((value, index) => (
              <div
                key={index}
                title={`${value} contributions`}
                className={`h-5 w-5 rounded-md transition-all duration-200 hover:-translate-y-1 hover:scale-110 ${getColor(
                  value
                )}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="text-sm text-slate-500">
          {total} total contributions
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Less</span>

          <div className="flex gap-2">
            <div className="h-4 w-4 rounded bg-[#1B2636]" />
            <div className="h-4 w-4 rounded bg-cyan-500/30" />
            <div className="h-4 w-4 rounded bg-cyan-500/60" />
            <div className="h-4 w-4 rounded bg-cyan-500/80" />
            <div className="h-4 w-4 rounded bg-cyan-400" />
          </div>

          <span>More</span>
        </div>
      </div>
    </section>
  );
}

export default ContributionHeatmap;