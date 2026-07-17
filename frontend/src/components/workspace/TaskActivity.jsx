import { History } from "lucide-react";

function TaskActivity({
  activities = [],
}) {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

      <div className="mb-5 flex items-center gap-3">

        <History
          size={20}
          className="text-cyan-400"
        />

        <h2 className="text-lg font-semibold">
          Activity
        </h2>

      </div>

      {activities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#263243] p-8 text-center text-sm text-gray-500">
          No activity yet.
        </div>
      ) : (
        <div className="space-y-5">

          {activities.map((activity) => (
            <div
              key={activity._id}
              className="border-l-2 border-cyan-500 pl-4"
            >

              <p className="text-sm text-gray-300">

                {activity.message}

              </p>

              <span className="text-xs text-gray-500">

                {new Date(
                  activity.createdAt
                ).toLocaleString()}

              </span>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default TaskActivity;