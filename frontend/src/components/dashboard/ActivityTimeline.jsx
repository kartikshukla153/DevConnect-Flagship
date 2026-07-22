import { Activity } from "lucide-react";
import ActivityItem from "./ActivityItem";

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
            <ActivityItem
              key={activity._id || index}
              activity={activity}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default ActivityTimeline;