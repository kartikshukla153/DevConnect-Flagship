import { CalendarDays, Flame } from "lucide-react";

function ContributionHeatmap({ contributions = [] }) {
  const totalDays = 140;
  const columns = 20;

  const cells = Array.from(
    { length: totalDays },
    (_, index) => Number(contributions[index] || 0)
  );

  const total = cells.reduce(
    (sum, value) => sum + value,
    0
  );

  const activeDays = cells.filter(
    (value) => value > 0
  ).length;

  const getColor = (value) => {
    if (value >= 4) return "bg-cyan-400";
    if (value === 3) return "bg-cyan-500/80";
    if (value === 2) return "bg-cyan-500/60";
    if (value === 1) return "bg-cyan-500/30";

    return "bg-[#1B2636]";
  };

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
  ];

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111827] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.14)] sm:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />

            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Engineering Activity
            </h2>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Your coding, project and collaboration consistency
            across DevConnect.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="min-w-[105px] rounded-2xl border border-white/[0.07] bg-[#0B1220] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Flame
                size={15}
                className="text-orange-400"
              />

              <span className="text-[10px] font-bold uppercase tracking-wider">
                Activity
              </span>
            </div>

            <p className="mt-2 text-xl font-black text-white">
              {total}
            </p>
          </div>

          <div className="min-w-[105px] rounded-2xl border border-white/[0.07] bg-[#0B1220] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <CalendarDays
                size={15}
                className="text-cyan-400"
              />

              <span className="text-[10px] font-bold uppercase tracking-wider">
                Active Days
              </span>
            </div>

            <p className="mt-2 text-xl font-black text-white">
              {activeDays}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          <div className="mb-3 grid grid-cols-7 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            {months.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {cells.map((value, index) => (
              <div
                key={index}
                title={`${value} contribution${
                  value === 1 ? "" : "s"
                }`}
                aria-label={`${value} contribution${
                  value === 1 ? "" : "s"
                }`}
                className={`aspect-square w-full max-w-6 rounded-md ${getColor(
                  value
                )} transition-all duration-200 hover:scale-110 hover:ring-1 hover:ring-cyan-300/60`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-600">
          {total} total contribution
          {total === 1 ? "" : "s"} across the displayed period
        </p>

        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
          <span>Less</span>

          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded bg-[#1B2636]" />
            <div className="h-3.5 w-3.5 rounded bg-cyan-500/30" />
            <div className="h-3.5 w-3.5 rounded bg-cyan-500/60" />
            <div className="h-3.5 w-3.5 rounded bg-cyan-500/80" />
            <div className="h-3.5 w-3.5 rounded bg-cyan-400" />
          </div>

          <span>More</span>
        </div>
      </div>
    </section>
  );
}

export default ContributionHeatmap;