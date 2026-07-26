import { Activity } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

function ActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (projectId) {
      loadActivities();
    }
  }, [projectId]);

  async function loadActivities() {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/projects/activity/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActivities(res.data.activities || []);
    } catch (err) {
      console.log(err);
    }
  }

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
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">
            No activity yet.
          </p>
        ) : (
          activities.map((item) => (
            <div
              key={item._id}
              className="border-l-2 border-cyan-500 pl-4"
            >
              <p className="text-sm text-gray-300">
                {item.message}
              </p>

              <span className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ActivityFeed;