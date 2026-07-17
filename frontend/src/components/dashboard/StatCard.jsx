function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "cyan",
}) {
  const colorClasses = {
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      glow: "group-hover:shadow-cyan-500/20",
    },
    green: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "group-hover:shadow-emerald-500/20",
    },
    yellow: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      border: "border-yellow-500/20",
      glow: "group-hover:shadow-yellow-500/20",
    },
    purple: {
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      border: "border-violet-500/20",
      glow: "group-hover:shadow-violet-500/20",
    },
  };

  const theme = colorClasses[color] || colorClasses.cyan;

  return (
    <div
      className={`group rounded-3xl border border-white/10 bg-[#111827] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl ${theme.glow}`}
    >
      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium tracking-wide text-gray-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-bold text-white">
            {value}
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            {subtitle}
          </p>

        </div>

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${theme.border} ${theme.bg}`}
        >
          <Icon
            size={26}
            className={theme.text}
          />
        </div>

      </div>

      <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-white/5">

        <div
          className={`h-full rounded-full ${theme.bg.replace("/10", "")}`}
          style={{ width: "70%" }}
        />

      </div>

    </div>
  );
}

export default StatCard;