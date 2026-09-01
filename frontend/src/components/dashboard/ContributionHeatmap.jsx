import {
  Activity,
  CalendarDays,
  Flame,
} from "lucide-react";

function dateKey(date) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

function startOfDay(date) {
  const value = new Date(date);

  value.setHours(
    0,
    0,
    0,
    0
  );

  return value;
}

function buildDays(activities) {
  const counts = new Map();

  activities.forEach((activity) => {
    const timestamp =
      activity?.createdAt ||
      activity?.timestamp ||
      activity?.date;

    const key = dateKey(timestamp);

    if (!key) {
      return;
    }

    counts.set(
      key,
      (counts.get(key) || 0) + 1
    );
  });

  const today = startOfDay(
    new Date()
  );

  const first = new Date(today);

  first.setDate(
    first.getDate() - 364
  );

  /*
   * Align to Sunday so the grid contains
   * complete week columns.
   */
  first.setDate(
    first.getDate() - first.getDay()
  );

  const days = [];

  for (
    let index = 0;
    index < 371;
    index += 1
  ) {
    const date = new Date(first);

    date.setDate(
      first.getDate() + index
    );

    const key = dateKey(date);

    days.push({
      date,
      key,
      count:
        counts.get(key) || 0,
    });
  }

  return days;
}

function level(count, peak) {
  if (!count) {
    return "border-white/[0.02] bg-[#182334]";
  }

  const ratio =
    peak > 0
      ? count / peak
      : 0;

  if (ratio >= 0.75) {
    return "border-cyan-300/20 bg-cyan-400";
  }

  if (ratio >= 0.5) {
    return "border-cyan-300/10 bg-cyan-400/75";
  }

  if (ratio >= 0.25) {
    return "border-cyan-300/10 bg-cyan-400/45";
  }

  return "border-cyan-300/5 bg-cyan-400/20";
}

function formatDate(date) {
  return date.toLocaleDateString(
    [],
    {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function calculateStreak(days) {
  const activeDays = new Set(
    days
      .filter(
        (day) => day.count > 0
      )
      .map((day) => day.key)
  );

  let cursor = startOfDay(
    new Date()
  );

  let streak = 0;

  while (
    activeDays.has(
      dateKey(cursor)
    )
  ) {
    streak += 1;

    cursor.setDate(
      cursor.getDate() - 1
    );
  }

  return streak;
}

function getMonthLabels(weeks) {
  const labels = [];

  weeks.forEach(
    (week, index) => {
      const first = week?.[0];

      if (!first) {
        return;
      }

      const month =
        first.date.toLocaleDateString(
          [],
          {
            month: "short",
          }
        );

      const previous =
        weeks[
          index - 1
        ]?.[0]?.date?.toLocaleDateString(
          [],
          {
            month: "short",
          }
        );

      if (
        month !== previous
      ) {
        labels.push({
          index,
          month,
        });
      }
    }
  );

  return labels;
}

export default function ContributionHeatmap({
  activities = [],
}) {
  const days =
    buildDays(activities);

  const today =
    startOfDay(new Date());

  const visibleDays =
    days.filter(
      (day) =>
        day.date <= today
    );

  const total =
    visibleDays.reduce(
      (sum, day) =>
        sum + day.count,
      0
    );

  const activeDays =
    visibleDays.filter(
      (day) =>
        day.count > 0
    ).length;

  const peak =
    Math.max(
      0,
      ...visibleDays.map(
        (day) => day.count
      )
    );

  const streak =
    calculateStreak(
      visibleDays
    );

  const weeks = [];

  for (
    let index = 0;
    index < days.length;
    index += 7
  ) {
    weeks.push(
      days.slice(
        index,
        index + 7
      )
    );
  }

  const monthLabels =
    getMonthLabels(
      weeks
    );

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111827] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.14)] sm:p-8">
      {/* HEADER */}
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <Activity
              size={18}
              className="text-cyan-400"
            />

            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Engineering activity
            </h2>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            A GitHub-style view of recorded DevConnect activity. Empty days stay empty — no synthetic data.
          </p>
        </div>

        {/* METRICS */}
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[105px] rounded-2xl border border-white/[0.06] bg-[#0B1220] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Flame
                size={14}
                className="text-orange-400"
              />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">
                Activity
              </span>
            </div>

            <p className="mt-2 text-xl font-black text-white">
              {total.toLocaleString()}
            </p>
          </div>

          <div className="min-w-[105px] rounded-2xl border border-white/[0.06] bg-[#0B1220] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-600">
              <CalendarDays
                size={14}
                className="text-cyan-400"
              />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">
                Active days
              </span>
            </div>

            <p className="mt-2 text-xl font-black text-white">
              {activeDays.toLocaleString()}
            </p>
          </div>

          <div className="min-w-[105px] rounded-2xl border border-white/[0.06] bg-[#0B1220] px-4 py-3">
            <div className="flex items-center gap-2 text-slate-600">
              <Flame
                size={14}
                className="text-emerald-400"
              />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em]">
                Streak
              </span>
            </div>

            <p className="mt-2 text-xl font-black text-white">
              {streak}
              <span className="ml-1 text-xs font-bold text-slate-600">
                days
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* HEATMAP */}
      <div className="mt-8 overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          {/* MONTH LABELS */}
          <div className="relative mb-3 h-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700">
            {monthLabels.map(
              ({
                index,
                month,
              }) => (
                <span
                  key={`${month}-${index}`}
                  className="absolute"
                  style={{
                    left: `${(
                      (index /
                        Math.max(
                          weeks.length - 1,
                          1
                        )) *
                      100
                    ).toFixed(2)}%`,
                  }}
                >
                  {month}
                </span>
              )
            )}
          </div>

          {/* GRID */}
          <div
            className="grid gap-[5px]"
            style={{
              gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
            }}
          >
            {weeks.map(
              (week, weekIndex) => (
                <div
                  key={`week-${weekIndex}`}
                  className="grid grid-rows-7 gap-[5px]"
                >
                  {week.map(
                    (day) => (
                      <div
                        key={day.key}
                        title={`${formatDate(
                          day.date
                        )} — ${
                          day.count
                        } recorded ${
                          day.count === 1
                            ? "event"
                            : "events"
                        }`}
                        aria-label={`${formatDate(
                          day.date
                        )}, ${
                          day.count
                        } recorded ${
                          day.count === 1
                            ? "event"
                            : "events"
                        }`}
                        className={`aspect-square w-full min-w-[10px] rounded-[3px] border transition-all duration-150 hover:scale-125 hover:ring-1 hover:ring-cyan-300/60 ${level(
                          day.count,
                          peak
                        )}`}
                      />
                    )
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-7 flex flex-col gap-4 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-600">
            {total.toLocaleString()} recorded{" "}
            {total === 1
              ? "activity"
              : "activities"}{" "}
            across the displayed period.
          </p>

          {peak > 0 && (
            <p className="mt-1 text-[10px] text-slate-700">
              Peak day: {peak}{" "}
              {peak === 1
                ? "event"
                : "events"}.
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-600">
          <span>Less</span>

          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 rounded border border-white/[0.02] bg-[#182334]" />
            <div className="h-3.5 w-3.5 rounded border border-cyan-300/5 bg-cyan-400/20" />
            <div className="h-3.5 w-3.5 rounded border border-cyan-300/10 bg-cyan-400/45" />
            <div className="h-3.5 w-3.5 rounded border border-cyan-300/10 bg-cyan-400/75" />
            <div className="h-3.5 w-3.5 rounded border border-cyan-300/20 bg-cyan-400" />
          </div>

          <span>More</span>
        </div>
      </div>
    </section>
  );
}