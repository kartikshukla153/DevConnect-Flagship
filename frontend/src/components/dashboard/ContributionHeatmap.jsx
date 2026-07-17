function ContributionHeatmap({ contributions = [] }) {
  const totalDays = 140;

  const cells = Array.from({ length: totalDays }, (_, index) => {
    return contributions[index] || 0;
  });

  const getColor = (value) => {
    if (value >= 4) return "bg-cyan-400";
    if (value === 3) return "bg-cyan-500/80";
    if (value === 2) return "bg-cyan-500/60";
    if (value === 1) return "bg-cyan-500/40";

    return "bg-[#1B2636]";
  };

  return (
    <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-white">
          Contribution Activity
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Your development consistency across DevConnect.
        </p>

      </div>

      <div className="overflow-x-auto">

        <div className="grid min-w-[700px] grid-cols-20 gap-2">

          {cells.map((value, index) => (

            <div
              key={index}
              title={`${value} contributions`}
              className={`h-5 w-5 rounded-md transition-all duration-200 hover:scale-125 ${getColor(
                value
              )}`}
            />

          ))}

        </div>

      </div>

      <div className="mt-8 flex items-center justify-between text-sm text-gray-500">

        <span>
          Less
        </span>

        <div className="flex gap-2">

          <div className="h-4 w-4 rounded bg-[#1B2636]" />
          <div className="h-4 w-4 rounded bg-cyan-500/40" />
          <div className="h-4 w-4 rounded bg-cyan-500/60" />
          <div className="h-4 w-4 rounded bg-cyan-500/80" />
          <div className="h-4 w-4 rounded bg-cyan-400" />

        </div>

        <span>
          More
        </span>

      </div>

    </section>
  );
}

export default ContributionHeatmap;