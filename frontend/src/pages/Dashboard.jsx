import { useEffect, useMemo, useState } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import QuickActions from "../components/dashboard/QuickActions";
import RecentProjects from "../components/dashboard/RecentProjects";
import MyTasks from "../components/dashboard/MyTasks";
import ContributionHeatmap from "../components/dashboard/ContributionHeatmap";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5000/api";

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

async function request(path) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      text || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.items)) return payload.items;

  if (Array.isArray(payload?.projects)) return payload.projects;

  if (Array.isArray(payload?.tasks)) return payload.tasks;

  if (Array.isArray(payload?.activities)) return payload.activities;

  if (Array.isArray(payload?.notifications)) {
    return payload.notifications;
  }

  if (Array.isArray(payload?.connections)) {
    return payload.connections;
  }

  if (Array.isArray(payload?.messages)) {
    return payload.messages;
  }

  return [];
}

function extractObject(payload) {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  if (payload.data && typeof payload.data === "object") {
    return payload.data;
  }

  return payload;
}

function normalizeProject(project) {
  return {
    ...project,

    _id: project._id || project.id,

    title:
      project.title ||
      project.name ||
      "Untitled Project",

    description:
      project.description ||
      "No project description available.",

    techStack:
      project.techStack ||
      project.technologies ||
      project.stack ||
      [],

    members:
      project.members ||
      project.teamMembers ||
      project.collaborators ||
      [],

    progress:
      typeof project.progress === "number"
        ? project.progress
        : 0,
  };
}

function normalizeTask(task) {
  return {
    ...task,

    _id: task._id || task.id,

    title:
      task.title ||
      task.name ||
      "Untitled Task",

    description:
      task.description ||
      "No task description available.",

    priority:
      task.priority ||
      "Medium",

    completed:
      Boolean(
        task.completed ||
          task.isCompleted ||
          task.status === "completed" ||
          task.status === "done"
      ),

    dueDate:
      task.dueDate ||
      task.deadline ||
      task.endDate ||
      null,
  };
}

function normalizeActivity(activity) {
  return {
    ...activity,

    _id:
      activity._id ||
      activity.id,

    type:
      activity.type ||
      activity.activityType ||
      "ACTIVITY",

    createdAt:
      activity.createdAt ||
      activity.timestamp ||
      activity.date ||
      new Date().toISOString(),

    user:
      activity.user ||
      activity.actor ||
      activity.author ||
      null,
  };
}

function normalizeContributions(payload) {
  const source = extractObject(payload);

  if (Array.isArray(source.contributions)) {
    return source.contributions.map((value) =>
      Number(value || 0)
    );
  }

  if (Array.isArray(source.data)) {
    return source.data.map((value) =>
      Number(value || 0)
    );
  }

  return [];
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-[250px] animate-pulse rounded-3xl border border-white/10 bg-[#111827]" />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-3xl border border-white/10 bg-[#111827]"
          />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <div className="h-[340px] animate-pulse rounded-3xl bg-[#111827]" />
          <div className="h-[300px] animate-pulse rounded-3xl bg-[#111827]" />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
          <div className="h-[480px] animate-pulse rounded-3xl bg-[#111827]" />
        </div>
      </div>
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-red-500/20 bg-[#111827]">
      <div className="max-w-md px-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertCircle
            size={28}
            className="text-red-400"
          />
        </div>

        <h2 className="mt-6 text-xl font-bold text-white">
          Dashboard data couldn't be loaded
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          {message ||
            "Something went wrong while loading your workspace data."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    projects: [],
    tasks: [],
    activities: [],
    contributions: [],
    connections: [],
    messages: [],
    notifications: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * These requests intentionally run in parallel.
       * One failing resource should not destroy the entire dashboard.
       */

      const results = await Promise.allSettled([
        request("/projects"),
        request("/tasks"),
        request("/notifications"),
        request("/connections"),
        request("/messages"),
        request("/activity"),
        request("/contributions"),
      ]);

      const [
        projectsResult,
        tasksResult,
        notificationsResult,
        connectionsResult,
        messagesResult,
        activityResult,
        contributionsResult,
      ] = results;

      const projects =
        projectsResult.status === "fulfilled"
          ? extractArray(projectsResult.value).map(
              normalizeProject
            )
          : [];

      const tasks =
        tasksResult.status === "fulfilled"
          ? extractArray(tasksResult.value).map(
              normalizeTask
            )
          : [];

      const notifications =
        notificationsResult.status === "fulfilled"
          ? extractArray(notificationsResult.value)
          : [];

      const connections =
        connectionsResult.status === "fulfilled"
          ? extractArray(connectionsResult.value)
          : [];

      const messages =
        messagesResult.status === "fulfilled"
          ? extractArray(messagesResult.value)
          : [];

      const activities =
        activityResult.status === "fulfilled"
          ? extractArray(activityResult.value).map(
              normalizeActivity
            )
          : [];

      const contributions =
        contributionsResult.status === "fulfilled"
          ? normalizeContributions(
              contributionsResult.value
            )
          : [];

      setDashboard({
        projects,
        tasks,
        activities,
        contributions,
        connections,
        messages,
        notifications,
      });

      /*
       * Only show a global error when every request failed.
       *
       * This keeps the dashboard resilient if one backend
       * module is temporarily unavailable.
       */
      const allFailed = results.every(
        (result) => result.status === "rejected"
      );

      if (allFailed) {
        throw new Error(
          "None of the dashboard services are currently responding."
        );
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(
        err?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = useMemo(
    () => ({
      projects: dashboard.projects.length,

      connections:
        dashboard.connections.length,

      messages:
        dashboard.messages.filter(
          (message) =>
            !message.read &&
            !message.isRead
        ).length,

      notifications:
        dashboard.notifications.filter(
          (notification) =>
            !notification.read &&
            !notification.isRead
        ).length,
    }),
    [dashboard]
  );

  /*
   * Keep the existing StatsGrid component compatible
   * while allowing it to receive real values.
   *
   * The next step will move these values into StatsGrid
   * permanently so it owns the presentation.
   */
  const dashboardStats = [
    {
      title: "Projects",
      value: stats.projects,
      change: "",
      subtitle:
        stats.projects === 1
          ? "active project"
          : "active projects",
    },
    {
      title: "Connections",
      value: stats.connections,
      change: "",
      subtitle:
        stats.connections === 1
          ? "developer connection"
          : "developer connections",
    },
    {
      title: "Messages",
      value: stats.messages,
      change: "",
      subtitle:
        stats.messages === 1
          ? "unread message"
          : "unread messages",
    },
    {
      title: "Notifications",
      value: stats.notifications,
      change: "",
      subtitle:
        stats.notifications === 1
          ? "need attention"
          : "need attention",
    },
  ];

  if (loading) {
    return <DashboardLoading />;
  }

  if (error && dashboard.projects.length === 0) {
    return (
      <DashboardError
        message={error}
        onRetry={loadDashboard}
      />
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <DashboardHeader />

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <AlertCircle
              size={17}
              className="shrink-0 text-amber-400"
            />

            <p className="truncate text-sm text-amber-200">
              Some dashboard data could not be loaded.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      )}

      <StatsGrid stats={dashboardStats} />

      {/* 
       * Compact command-center layout:
       * - Recent activity is intentionally capped to the latest 5 events.
       * - My Sprint is intentionally capped to the 4 most relevant tasks.
       * - Active Projects remains a first-class dashboard section.
       * - Full datasets are still fetched above, so no backend functionality is lost.
       */}
      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <ActivityTimeline
            activities={dashboard.activities.slice(0, 5)}
          />

          <RecentProjects
            projects={dashboard.projects.slice(0, 3)}
          />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-4">
          <QuickActions />

          <MyTasks
            tasks={dashboard.tasks.slice(0, 4)}
          />
        </div>
      </div>

      <ContributionHeatmap
        contributions={dashboard.contributions}
      />
    </div>
  );
}

export default Dashboard;