import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  FolderKanban,
  MessageSquare,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const labels = {
  TASK_CREATED: "created a task",
  TASK_DELETED: "deleted a task",
  TASK_STATUS_UPDATED: "updated a task status",
  TASK_UPDATED: "updated a task",
  PROJECT_CREATED: "created a project",
  PROJECT_UPDATED: "updated a project",
  PROJECT_JOINED: "joined a project",
  CONNECTION_CREATED: "connected with a developer",
  CONNECTION_ACCEPTED: "accepted a connection",
  MESSAGE_SENT: "sent a message",
  POST_CREATED: "published a post",
  POST_LIKED: "liked a post",
  COMMENT_CREATED: "commented on a post",
};

function eventLabel(activity) {
  const type = String(
    activity?.type ||
      activity?.activityType ||
      "activity"
  ).toUpperCase();

  return (
    labels[type] ||
    type
      .toLowerCase()
      .replaceAll("_", " ")
  );
}

function eventIcon(activity) {
  const type = String(
    activity?.type ||
      activity?.activityType ||
      ""
  ).toUpperCase();

  if (type.includes("TASK")) {
    return CheckCircle2;
  }

  if (type.includes("PROJECT")) {
    return FolderKanban;
  }

  if (type.includes("CONNECTION")) {
    return Users;
  }

  if (type.includes("MESSAGE")) {
    return MessageSquare;
  }

  if (
    type.includes("POST") ||
    type.includes("COMMENT")
  ) {
    return Bell;
  }

  return Activity;
}

function formatTime(value) {
  if (!value) {
    return "Timestamp unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Timestamp unavailable";
  }

  const seconds = Math.max(
    0,
    (Date.now() - date.getTime()) / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }

  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  }

  if (seconds < 604800) {
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function getActivityTarget(activity) {
  return (
    activity?.project?._id ||
    activity?.project?.id ||
    activity?.projectId ||
    activity?.projectID ||
    null
  );
}

export default function ActivityTimeline({
  activities = [],
}) {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111827] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.14)] sm:p-8">
      {/* HEADER */}
      <div className="mb-7 flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.7)]" />

            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Recent activity
            </h2>
          </div>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Recorded events from your projects and collaboration workspace.
          </p>
        </div>

        {activities.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="hidden items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-cyan-400 sm:flex"
          >
            Open projects

            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {activities.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-[#0B1220] px-6 py-16 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-cyan-400/[0.05] blur-3xl" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.07]">
            <Zap
              size={27}
              className="text-cyan-400"
            />
          </div>

          <h3 className="relative mt-5 text-lg font-bold text-white">
            No activity recorded yet
          </h3>

          <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            This section will populate from real project
            events as you create, update and collaborate
            inside DevConnect.
          </p>

          <button
            type="button"
            onClick={() => navigate("/projects/create")}
            className="relative mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.06] hover:text-cyan-300"
          >
            <FolderKanban size={14} />

            Create your first project
          </button>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.05] rounded-2xl border border-white/[0.06] bg-[#0B1220] px-4">
          {activities.map(
            (activity, index) => {
              const Icon = eventIcon(activity);

              const actor =
                activity?.user?.name ||
                activity?.actor?.name ||
                activity?.author?.name ||
                "You";

              const detail =
                activity?.message ||
                activity?.description ||
                "";

              const projectId =
                getActivityTarget(activity);

              const handleOpen = () => {
                if (projectId) {
                  navigate(
                    `/projects/${projectId}`
                  );
                }
              };

              return (
                <div
                  key={
                    activity?._id ||
                    `${activity?.createdAt}-${index}`
                  }
                  className={`group flex gap-3 py-4 ${
                    projectId
                      ? "cursor-pointer"
                      : ""
                  }`}
                  onClick={handleOpen}
                  role={
                    projectId
                      ? "button"
                      : undefined
                  }
                  tabIndex={
                    projectId ? 0 : undefined
                  }
                  onKeyDown={(event) => {
                    if (
                      projectId &&
                      (event.key === "Enter" ||
                        event.key === " ")
                    ) {
                      event.preventDefault();
                      handleOpen();
                    }
                  }}
                >
                  {/* ICON */}
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05]">
                    <Icon
                      size={16}
                      className="text-cyan-300"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 text-slate-300">
                      <span className="font-bold text-white">
                        {actor}
                      </span>{" "}

                      {eventLabel(activity)}

                      {detail ? (
                        <span className="text-slate-500">
                          {" "}
                          — {detail}
                        </span>
                      ) : null}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-700">
                        {formatTime(
                          activity?.createdAt ||
                            activity?.timestamp ||
                            activity?.date
                        )}
                      </p>

                      {projectId && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-slate-800" />

                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-cyan-500/50 transition group-hover:text-cyan-400">
                            Open project
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}