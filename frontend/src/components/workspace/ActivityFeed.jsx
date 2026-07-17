import { Activity } from "lucide-react";

const demoActivities = [
  {
    id: 1,
    text: "Kartik created API Authentication task",
    time: "2 min ago",
  },
  {
    id: 2,
    text: "Rahul moved UI task to Review",
    time: "12 min ago",
  },
  {
    id: 3,
    text: "Ankit joined the workspace",
    time: "20 min ago",
  },
  {
    id: 4,
    text: "AI generated sprint summary",
    time: "45 min ago",
  },
];

function ActivityFeed() {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

      <div className="mb-5 flex items-center gap-3">

        <Activity
          size={20}
          className="text-cyan-400"
        />

        <h2 className="text-lg font-semibold text-white">
          Activity
        </h2>

      </div>

      <div className="space-y-5">

        {demoActivities.map((item) => (
          <div
            key={item.id}
            className="border-l-2 border-cyan-500 pl-4"
          >
            <p className="text-sm text-gray-300">
              {item.text}
            </p>

            <span className="text-xs text-gray-500">
              {item.time}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}

export default ActivityFeed;