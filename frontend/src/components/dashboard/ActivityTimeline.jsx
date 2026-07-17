import {
  Activity,
  ArrowRight,
} from "lucide-react";

function ActivityTimeline({ activities = [] }) {
  return (
    <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            Recent Activity
          </h2>

          <p className="mt-2 text-sm text-gray-400">
            Track your latest development activity across DevConnect.
          </p>

        </div>

      </div>

      {activities.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#263243]">

          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">

            <Activity
              size={28}
              className="text-cyan-400"
            />

          </div>

          <h3 className="mt-6 text-lg font-semibold text-white">
            No Activity Yet
          </h3>

          <p className="mt-2 max-w-md text-center text-sm leading-7 text-gray-400">
            Your posts, project updates, task completions,
            connections and collaboration activity will appear here.
          </p>

        </div>
      ) : (
        <div className="space-y-8">

          {activities.map((activity, index) => (

            <div
              key={activity._id || index}
              className="flex gap-5"
            >

              <div className="flex flex-col items-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">

                  <Activity
                    size={18}
                    className="text-cyan-400"
                  />

                </div>

                {index !== activities.length - 1 && (
                  <div className="mt-2 h-full w-px bg-[#263243]" />
                )}

              </div>

              <div className="flex-1 rounded-2xl border border-[#263243] bg-[#0B1220] p-5 transition hover:border-cyan-500">

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold text-white">
                    {activity.title}
                  </h3>

                  <ArrowRight
                    size={16}
                    className="text-gray-500"
                  />

                </div>

                <p className="mt-3 leading-7 text-gray-400">
                  {activity.description}
                </p>

                <p className="mt-4 text-xs text-gray-500">
                  {activity.time}
                </p>

              </div>

            </div>

          ))}

        </div>
      )}

    </section>
  );
}

export default ActivityTimeline;