import {
  Activity,
  CheckCircle2,
  Clock3,
  Trash2,
  UserPlus,
  MessageSquare,
  GitBranch,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function getActivityIcon(type) {
  switch (type) {
    case "task_created":
      return (
        <Activity
          size={16}
          className="text-cyan-400"
        />
      );

    case "task_assigned":
      return (
        <UserPlus
          size={16}
          className="text-blue-400"
        />
      );

    case "task_status_updated":
      return (
        <Clock3
          size={16}
          className="text-amber-400"
        />
      );

    case "task_completed":
      return (
        <CheckCircle2
          size={16}
          className="text-emerald-400"
        />
      );

    case "task_submission_approved":
      return (
        <CheckCircle2
          size={16}
          className="text-emerald-400"
        />
      );

    case "task_submission_rejected":
      return (
        <Clock3
          size={16}
          className="text-red-400"
        />
      );

    case "task_reviewed":
      return (
        <FileText
          size={16}
          className="text-violet-400"
        />
      );

    case "comment_added":
      return (
        <MessageSquare
          size={16}
          className="text-sky-400"
        />
      );

    case "github_connected":
    case "github_pr_linked":
      return (
        <GitBranch
          size={16}
          className="text-purple-400"
        />
      );

    case "task_deleted":
      return (
        <Trash2
          size={16}
          className="text-red-400"
        />
      );

    default:
      return (
        <Activity
          size={16}
          className="text-cyan-400"
        />
      );
  }
}

function getActivityAccent(type) {
  switch (type) {
    case "task_deleted":
    case "task_submission_rejected":
      return "border-red-500/20 bg-red-500/5";

    case "task_submission_approved":
    case "task_completed":
      return "border-emerald-500/20 bg-emerald-500/5";

    case "task_status_updated":
      return "border-amber-500/20 bg-amber-500/5";

    case "task_assigned":
      return "border-blue-500/20 bg-blue-500/5";

    default:
      return "border-white/10 bg-[#0B1220]";
  }
}

function ActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  async function loadActivities() {
    if (!projectId) return;

    try {
      const response = await axios.get(
        `${API}/projects/activity/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActivities(
        response.data.activities || []
      );
    } catch (error) {
      console.error(
        "Activity load failed:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!projectId) return;

    loadActivities();

    const interval = setInterval(
      loadActivities,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, [projectId]);

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#111827]">

      {/* HEADER */}

      <div className="border-b border-white/10 p-6">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
              <Activity
                size={19}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Activity
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Latest project events
              </p>
            </div>

          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
            {activities.length}
          </span>

        </div>

      </div>

      {/* ACTIVITY CONTENT */}

      <div className="max-h-[520px] overflow-y-auto p-6">

        {loading ? (

          <div className="flex flex-col items-center justify-center py-12">

            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

            <p className="text-sm text-slate-500">
              Loading activity...
            </p>

          </div>

        ) : activities.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] px-6 py-10 text-center">

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">

              <Activity
                size={24}
                className="text-slate-600"
              />

            </div>

            <p className="text-sm font-medium text-slate-400">
              No activity yet
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Project events will appear here as your
              team works.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {activities.map(
              (item, index) => (
                <div
                  key={item._id}
                  className={`
                    group
                    relative
                    rounded-2xl
                    border
                    p-4
                    transition-all
                    duration-200
                    hover:border-cyan-500/20
                    hover:bg-white/[0.02]
                    ${getActivityAccent(
                      item.type
                    )}
                  `}
                >

                  <div className="flex gap-4">

                    {/* ICON */}

                    <div className="relative shrink-0">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#111827]">

                        {getActivityIcon(
                          item.type
                        )}

                      </div>

                      {index <
                        activities.length -
                          1 && (
                        <div className="absolute left-1/2 top-10 h-[calc(100%+16px)] w-px -translate-x-1/2 bg-white/5" />
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="min-w-0 flex-1">

                      <p className="text-sm leading-6 text-slate-300">
                        {item.message}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        {item.user?.name && (
                          <>
                            <span className="text-xs font-medium text-cyan-400">
                              {item.user.name}
                            </span>

                            <span className="text-xs text-slate-700">
                              •
                            </span>
                          </>
                        )}

                        <span className="text-xs text-slate-500">
                          {new Date(
                            item.createdAt
                          ).toLocaleString()}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>
              )
            )}

          </div>

        )}

      </div>

      {/* FOOTER */}

      {activities.length > 0 && (
        <div className="border-t border-white/10 bg-[#0B1220]/50 px-6 py-3">

          <p className="text-center text-[11px] text-slate-600">
            Activity refreshes automatically
          </p>

        </div>
      )}

    </section>
  );
}

export default ActivityFeed;