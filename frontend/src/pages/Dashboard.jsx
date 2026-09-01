import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Code2,
  Database,
  FolderKanban,
  GitBranch,
  MessageSquare,
  RefreshCw,
  Server,
  Sparkles,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import DashboardHeader from "../components/dashboard/DashboardHeader";

const CARD =
  "rounded-2xl border border-white/[0.08] bg-[#0f1726]/90 shadow-[0_18px_50px_rgba(0,0,0,.16)]";

function getApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim() || "http://localhost:5000";
  const base = configured.replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

const API_BASE = getApiBase();

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

function getUserIdFromToken() {
  const raw = getToken();
  if (!raw) return "";

  try {
    const part = raw.split(".")[1];
    if (!part) return "";

    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );

    const payload = JSON.parse(atob(padded));
    return String(payload?.id || payload?._id || payload?.userId || "");
  } catch {
    return "";
  }
}

async function api(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    },
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || `Request failed (${response.status})`);
  }

  return data;
}

function arrayFrom(value, keys = []) {
  if (Array.isArray(value)) return value;

  for (const key of [...keys, "data", "items", "results", "records"]) {
    if (Array.isArray(value?.[key])) return value[key];
  }

  return [];
}

function objectId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;

  return String(
    value?._id ||
      value?.id ||
      value?.userId ||
      value?.projectId ||
      value?.user?._id ||
      value?.user?.id ||
      ""
  );
}

function belongsToUser(project, userId) {
  if (!project || !userId) return false;

  const owners = [
    project.creator,
    project.createdBy,
    project.owner,
    project.user,
  ].map(objectId);

  if (owners.includes(userId)) return true;

  return Array.isArray(project.members)
    ? project.members.some(
        (member) =>
          objectId(member?.user || member?.userId || member) === userId
      )
    : false;
}

function isDone(task) {
  return Boolean(
    task?.completed ||
      task?.isCompleted ||
      ["done", "completed"].includes(String(task?.status || "").toLowerCase())
  );
}

function priorityRank(priority) {
  return (
    {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    }[String(priority || "medium").toLowerCase()] || 2
  );
}

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  const seconds = Math.max(0, (Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

function eventLabel(activity) {
  const type = String(
    activity?.type || activity?.activityType || "activity"
  ).toUpperCase();

  const labels = {
    TASK_CREATED: "created a task",
    TASK_DELETED: "deleted a task",
    TASK_STATUS_UPDATED: "updated task status",
    TASK_UPDATED: "updated a task",
    PROJECT_CREATED: "created a project",
    PROJECT_UPDATED: "updated a project",
    PROJECT_JOINED: "joined a project",
    CONNECTION_CREATED: "connected with a developer",
    CONNECTION_ACCEPTED: "accepted a connection",
    MESSAGE_SENT: "sent a message",
  };

  return labels[type] || type.toLowerCase().replaceAll("_", " ");
}

function projectProgress(project, tasks) {
  if (typeof project?.progress === "number") {
    return Math.max(0, Math.min(100, project.progress));
  }

  const projectTasks = tasks.filter(
    (task) =>
      objectId(task?.project || task?.projectId) === objectId(project)
  );

  if (!projectTasks.length) return 0;

  return Math.round(
    (projectTasks.filter(isDone).length / projectTasks.length) * 100
  );
}

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(value) {
  const date = startOfDay(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function buildContributionGrid(activities, tasks, projects) {
  const today = startOfDay(new Date());
  const first = new Date(today);
  first.setDate(first.getDate() - 364);
  first.setDate(first.getDate() - first.getDay());

  const counts = new Map();

  const add = (value) => {
    if (!value) return;

    const date = new Date(value);
    if (Number.isNaN(date.getTime()) || date > today || date < first) return;

    const key = dateKey(date);
    counts.set(key, (counts.get(key) || 0) + 1);
  };

  activities.forEach((item) =>
    add(item?.createdAt || item?.timestamp || item?.date)
  );

  if (!activities.length) {
    tasks.forEach((item) =>
      add(item?.updatedAt || item?.createdAt || item?.dueDate)
    );

    projects.forEach((item) =>
      add(item?.updatedAt || item?.createdAt)
    );
  }

  const weeks = [];

  for (let week = 0; week < 53; week += 1) {
    const days = [];

    for (let day = 0; day < 7; day += 1) {
      const date = new Date(first);
      date.setDate(first.getDate() + week * 7 + day);

      days.push({
        date,
        key: dateKey(date),
        count:
          date <= today && date >= first
            ? counts.get(dateKey(date)) || 0
            : 0,
      });
    }

    weeks.push(days);
  }

  const allDays = weeks.flat().filter((item) => item.date <= today);
  const total = allDays.reduce((sum, item) => sum + item.count, 0);
  const activeDays = allDays.filter((item) => item.count > 0).length;
  const peak = allDays.reduce(
    (max, item) => Math.max(max, item.count),
    0
  );

  const dayMap = new Map(allDays.map((item) => [item.key, item.count]));
  const cursor = new Date(today);

  if (!dayMap.get(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (dayMap.get(dateKey(cursor)) > 0) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return {
    weeks,
    total,
    activeDays,
    peak,
    streak,
  };
}

function contributionClass(count, peak) {
  if (!count) return "bg-white/[0.035] border-white/[0.02]";
  if (peak <= 1) return "bg-cyan-400/45 border-cyan-300/10";

  const ratio = count / peak;

  if (ratio <= 0.25) return "bg-cyan-400/20 border-cyan-300/5";
  if (ratio <= 0.5) return "bg-cyan-400/35 border-cyan-300/5";
  if (ratio <= 0.75) return "bg-cyan-400/55 border-cyan-300/10";
  return "bg-cyan-400/80 border-cyan-300/15";
}

function SectionTitle({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-white">
          <Icon size={17} className="shrink-0 text-cyan-400" />
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        </div>

        {subtitle ? (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      {action}
    </div>
  );
}

function Metric({ icon: Icon, label, value, hint, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${CARD} group min-w-0 p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-[#111b2c]`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">
          <Icon size={17} className="text-cyan-300" />
        </div>

        <ArrowUpRight
          size={15}
          className="text-slate-700 transition group-hover:text-cyan-400"
        />
      </div>

      <div className="mt-5 text-3xl font-black tracking-tight text-white">
        {value}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-300">
        {label}
      </div>

      <div className="mt-1 truncate text-[11px] text-slate-500">
        {hint}
      </div>
    </button>
  );
}

function ServiceRow({ icon: Icon, label, status }) {
  const ok = status === "operational";
  const degraded = status === "degraded";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025]">
        <Icon size={14} className="text-slate-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold text-slate-200">{label}</div>
        <div className="mt-0.5 text-[10px] text-slate-600">
          {ok ? "Responding normally" : degraded ? "Partially available" : "Unavailable"}
        </div>
      </div>

      <span
        className={`h-2 w-2 rounded-full ${
          ok
            ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,.55)]"
            : degraded
            ? "bg-amber-400"
            : "bg-red-400"
        }`}
      />
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="space-y-6 pb-10">
      <div className="h-56 animate-pulse rounded-3xl bg-[#111827]" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-2xl bg-[#111827]"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <div className="h-80 animate-pulse rounded-2xl bg-[#111827]" />
          <div className="h-72 animate-pulse rounded-2xl bg-[#111827]" />
        </div>

        <div className="space-y-6 xl:col-span-4">
          <div className="h-64 animate-pulse rounded-2xl bg-[#111827]" />
          <div className="h-72 animate-pulse rounded-2xl bg-[#111827]" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState({
    projects: [],
    tasks: [],
    activities: [],
    connections: [],
    conversations: [],
    notifications: [],
    unread: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [serviceState, setServiceState] = useState({
    projects: "degraded",
    connections: "degraded",
    conversations: "degraded",
    messages: "degraded",
    notifications: "degraded",
  });

  const loadDashboard = async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const userId = getUserIdFromToken();

      const results = await Promise.allSettled([
        api("/projects"),
        api("/connections/my-connections"),
        api("/conversations"),
        api("/messages/unread/count"),
        api("/notifications"),
      ]);

      const [
        projectsResult,
        connectionsResult,
        conversationsResult,
        unreadResult,
        notificationsResult,
      ] = results;

      const allProjects =
        projectsResult.status === "fulfilled"
          ? arrayFrom(projectsResult.value, ["projects"])
          : [];

      const ownedProjects = allProjects.filter((project) =>
        belongsToUser(project, userId)
      );

      const projects =
        ownedProjects.length || !allProjects.length
          ? ownedProjects
          : allProjects;

      const connections =
        connectionsResult.status === "fulfilled"
          ? arrayFrom(connectionsResult.value, ["connections"])
          : [];

      const conversations =
        conversationsResult.status === "fulfilled"
          ? arrayFrom(conversationsResult.value, ["conversations"])
          : [];

      const notifications =
        notificationsResult.status === "fulfilled"
          ? arrayFrom(notificationsResult.value, ["notifications"])
          : [];

      const unread =
        unreadResult.status === "fulfilled"
          ? Number(
              unreadResult.value?.unreadCount ??
                unreadResult.value?.count ??
                unreadResult.value?.data?.unreadCount ??
                0
            )
          : 0;

      const projectIds = projects
        .map(objectId)
        .filter(Boolean)
        .slice(0, 20);

      const taskSets = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            return arrayFrom(
              await api(`/tasks/project/${projectId}`),
              ["tasks"]
            );
          } catch {
            return [];
          }
        })
      );

      const activitySets = await Promise.all(
        projectIds.map(async (projectId) => {
          try {
            return arrayFrom(
              await api(`/activity/${projectId}`),
              ["activities"]
            );
          } catch {
            return [];
          }
        })
      );

      const tasks = taskSets.flat();
      const activities = activitySets
        .flat()
        .sort(
          (a, b) =>
            new Date(
              b?.createdAt || b?.timestamp || b?.date || 0
            ) -
            new Date(
              a?.createdAt || a?.timestamp || a?.date || 0
            )
        );

      setData({
        projects,
        tasks,
        activities,
        connections,
        conversations,
        notifications,
        unread,
      });

      const nextServiceState = {
        projects:
          projectsResult.status === "fulfilled"
            ? "operational"
            : "unavailable",
        connections:
          connectionsResult.status === "fulfilled"
            ? "operational"
            : "unavailable",
        conversations:
          conversationsResult.status === "fulfilled"
            ? "operational"
            : "unavailable",
        messages:
          unreadResult.status === "fulfilled"
            ? "operational"
            : "unavailable",
        notifications:
          notificationsResult.status === "fulfilled"
            ? "operational"
            : "unavailable",
      };

      setServiceState(nextServiceState);

      const failed = Object.values(nextServiceState).filter(
        (value) => value !== "operational"
      ).length;

      if (failed) {
        setError(
          `${failed} dashboard service${failed > 1 ? "s" : ""} could not be reached. Showing available data.`
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          "Dashboard data could not be loaded. Check that the API server is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard(false);
  }, []);

  const stats = useMemo(() => {
    const completed = data.tasks.filter(isDone).length;
    const open = Math.max(0, data.tasks.length - completed);

    const activeProjects = data.projects.filter(
      (project) =>
        !["completed", "archived"].includes(
          String(project?.status || "active").toLowerCase()
        )
    ).length;

    const urgent = data.tasks.filter(
      (task) =>
        ["critical", "high"].includes(
          String(task?.priority || "").toLowerCase()
        ) && !isDone(task)
    ).length;

    return {
      completed,
      open,
      activeProjects,
      urgent,
    };
  }, [data]);

  const contribution = useMemo(
    () =>
      buildContributionGrid(
        data.activities,
        data.tasks,
        data.projects
      ),
    [data.activities, data.tasks, data.projects]
  );

  const projectRows = useMemo(
    () =>
      [...data.projects]
        .sort(
          (a, b) =>
            new Date(b?.updatedAt || b?.createdAt || 0) -
            new Date(a?.updatedAt || a?.createdAt || 0)
        )
        .slice(0, 4),
    [data.projects]
  );

  const taskRows = useMemo(
    () =>
      [...data.tasks]
        .filter((task) => !isDone(task))
        .sort(
          (a, b) =>
            priorityRank(b?.priority) - priorityRank(a?.priority) ||
            new Date(
              a?.dueDate || a?.deadline || "9999-12-31"
            ) -
              new Date(
                b?.dueDate || b?.deadline || "9999-12-31"
              )
        )
        .slice(0, 5),
    [data.tasks]
  );

  const activityRows = data.activities.slice(0, 7);

  const overallHealth = Object.values(serviceState).every(
    (status) => status === "operational"
  )
    ? "Operational"
    : Object.values(serviceState).some(
        (status) => status === "operational"
      )
    ? "Degraded"
    : "Unavailable";

  if (loading) return <LoadingDashboard />;

  return (
    <div className="space-y-6 pb-12">
      <DashboardHeader />

      {/* SERVICE WARNING */}
      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] px-4 py-3 text-xs text-amber-200 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex min-w-0 items-start gap-2">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </span>

          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="inline-flex items-center gap-2 font-semibold text-amber-100 hover:text-white"
          >
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      ) : null}

      {/* KPI STRIP */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={FolderKanban}
          label="Active projects"
          value={stats.activeProjects}
          hint={`${data.projects.length} total in your workspace`}
          onClick={() => (window.location.href = "/projects")}
        />

        <Metric
          icon={CircleDot}
          label="Open tasks"
          value={stats.open}
          hint={`${stats.completed} completed across projects`}
          onClick={() => (window.location.href = "/projects")}
        />

        <Metric
          icon={MessageSquare}
          label="Unread messages"
          value={data.unread}
          hint={`${data.conversations.length} active conversations`}
          onClick={() => (window.location.href = "/messages")}
        />

        <Metric
          icon={Users}
          label="Connections"
          value={data.connections.length}
          hint="developers in your network"
          onClick={() => (window.location.href = "/connections")}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 items-start gap-6">
        {/* LEFT */}
        <div className="col-span-12 space-y-6 xl:col-span-8">
          {/* ACTIVE PROJECTS */}
          <section className={`${CARD} p-5 sm:p-6`}>
            <SectionTitle
              icon={FolderKanban}
              title="Active projects"
              subtitle="The work currently moving through your engineering workspace."
              action={
                <button
                  type="button"
                  onClick={() => (window.location.href = "/projects")}
                  className="text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
                >
                  View all <ChevronRight className="inline" size={13} />
                </button>
              }
            />

            {projectRows.length ? (
              <div className="space-y-3">
                {projectRows.map((project) => {
                  const progress = projectProgress(project, data.tasks);
                  const technologies = Array.isArray(project?.techStack)
                    ? project.techStack
                    : Array.isArray(project?.technologies)
                    ? project.technologies
                    : [];

                  return (
                    <button
                      type="button"
                      key={objectId(project)}
                      onClick={() =>
                        (window.location.href = `/workspace/${objectId(project)}`)
                      }
                      className="group w-full rounded-xl border border-white/[0.06] bg-[#0a1220] p-4 text-left transition duration-200 hover:border-cyan-400/20 hover:bg-[#0c1726]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-white">
                            {project?.title ||
                              project?.name ||
                              "Untitled project"}
                          </div>

                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            {project?.description ||
                              "No project description available."}
                          </p>
                        </div>

                        <ArrowUpRight
                          size={15}
                          className="shrink-0 text-slate-600 transition group-hover:text-cyan-400"
                        />
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <span className="w-9 text-right text-[11px] font-bold text-slate-300">
                          {progress}%
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Users size={12} />
                          {Array.isArray(project?.members)
                            ? project.members.length
                            : 0}{" "}
                          members
                        </span>

                        <span className="flex items-center gap-1">
                          <GitBranch size={12} />
                          {technologies.slice(0, 3).join(" · ") ||
                            "Engineering"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                <FolderKanban
                  size={22}
                  className="mx-auto text-slate-700"
                />
                <p className="mt-3 text-xs font-medium text-slate-500">
                  No active projects yet.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    (window.location.href = "/projects/create")
                  }
                  className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  Create your first project
                </button>
              </div>
            )}
          </section>

          {/* ACTIVITY */}
          <section className={`${CARD} p-5 sm:p-6`}>
            <SectionTitle
              icon={Activity}
              title="Recent activity"
              subtitle="A live stream of meaningful changes across your workspace."
              action={
                <span className="text-[10px] uppercase tracking-widest text-slate-600">
                  Live data
                </span>
              }
            />

            {activityRows.length ? (
              <div className="divide-y divide-white/[0.04]">
                {activityRows.map((activity, index) => (
                  <div
                    key={
                      activity?._id ||
                      activity?.id ||
                      `${activity?.createdAt}-${index}`
                    }
                    className="flex gap-3 px-1 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05]">
                      <Zap size={14} className="text-cyan-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="text-xs leading-5 text-slate-300">
                        <span className="font-semibold text-white">
                          {activity?.user?.name ||
                            activity?.actor?.name ||
                            activity?.author?.name ||
                            "You"}
                        </span>{" "}
                        {eventLabel(activity)}

                        {activity?.message || activity?.description ? (
                          <span className="text-slate-500">
                            {" "}
                            — {activity.message || activity.description}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 text-[10px] text-slate-600">
                        {relativeTime(
                          activity?.createdAt ||
                            activity?.timestamp ||
                            activity?.date
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-600">
                No activity recorded yet.
              </div>
            )}
          </section>

          {/* GITHUB-STYLE CONTRIBUTIONS */}
          <section className={`${CARD} overflow-hidden p-5 sm:p-6`}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-white">
                  <Code2 size={17} className="text-cyan-400" />
                  <h2 className="text-lg font-bold tracking-tight">
                    Contributions
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  Engineering activity across DevConnect.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {contribution.total}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                    contributions
                  </div>
                </div>

                <div className="h-9 w-px bg-white/[0.07]" />

                <div>
                  <div className="text-2xl font-black tracking-tight text-white">
                    {contribution.activeDays}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                    active days
                  </div>
                </div>

                <div className="h-9 w-px bg-white/[0.07]" />

                <div>
                  <div className="text-2xl font-black tracking-tight text-cyan-300">
                    {contribution.streak}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                    day streak
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-1">
              <div className="min-w-[760px]">
                <div className="mb-2 ml-8 grid grid-cols-12 text-[9px] uppercase tracking-[0.15em] text-slate-700">
                  {Array.from({ length: 12 }).map((_, index) => {
                    const weekIndex = Math.min(
                      52,
                      Math.floor((index * 52) / 12)
                    );
                    const date =
                      contribution.weeks[weekIndex]?.[0]?.date;

                    return (
                      <span key={index}>
                        {date
                          ? date.toLocaleDateString([], {
                              month: "short",
                            })
                          : ""}
                      </span>
                    );
                  })}
                </div>

                <div className="flex gap-1">
                  <div className="flex w-7 shrink-0 flex-col justify-between py-[1px] text-[8px] text-slate-700">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  <div className="flex gap-1">
                    {contribution.weeks.map((week, weekIndex) => (
                      <div
                        key={weekIndex}
                        className="flex flex-col gap-1"
                      >
                        {week.map((day) => (
                          <div
                            key={day.key}
                            title={`${day.date.toLocaleDateString([], {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}: ${day.count} contribution${
                              day.count === 1 ? "" : "s"
                            }`}
                            className={`h-3 w-3 rounded-[3px] border ${contributionClass(
                              day.count,
                              contribution.peak
                            )}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-600">
              <span>
                {contribution.total} contribution
                {contribution.total === 1 ? "" : "s"} across the displayed period
              </span>

              <span className="flex items-center gap-1.5">
                Less
                <span className="h-3 w-3 rounded-[3px] bg-white/[0.035]" />
                <span className="h-3 w-3 rounded-[3px] bg-cyan-400/20" />
                <span className="h-3 w-3 rounded-[3px] bg-cyan-400/35" />
                <span className="h-3 w-3 rounded-[3px] bg-cyan-400/55" />
                <span className="h-3 w-3 rounded-[3px] bg-cyan-400/80" />
                More
              </span>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 space-y-6 xl:col-span-4">
          {/* COMMAND CENTER */}
          <section className={`${CARD} p-5`}>
            <SectionTitle
              icon={Zap}
              title="Command center"
              subtitle="Jump directly into the work that matters."
            />

            <div className="space-y-2">
              {[
                [
                  "New project",
                  "Start a collaborative workspace",
                  FolderKanban,
                  "/projects/create",
                ],
                [
                  "Messages",
                  "Continue recent conversations",
                  MessageSquare,
                  "/messages",
                ],
                [
                  "Find developers",
                  "Discover engineers to collaborate",
                  Users,
                  "/developers",
                ],
                [
                  "AI Architect",
                  "Design scalable systems with AI",
                  Sparkles,
                  "/ai-architect",
                ],
              ].map(([label, subtitle, Icon, path]) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => (window.location.href = path)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3 text-left transition hover:border-cyan-400/15 hover:bg-cyan-400/[0.03]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05]">
                    <Icon size={16} className="text-cyan-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white">
                      {label}
                    </div>
                    <div className="mt-0.5 truncate text-[10px] text-slate-600">
                      {subtitle}
                    </div>
                  </div>

                  <ArrowUpRight
                    size={14}
                    className="text-slate-700 transition group-hover:text-cyan-400"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* MY SPRINT */}
          <section className={`${CARD} p-5`}>
            <SectionTitle
              icon={CircleDot}
              title="My sprint"
              subtitle="Open work ranked by urgency."
              action={
                <span className="text-[10px] font-semibold text-slate-600">
                  {stats.open} open
                </span>
              }
            />

            {taskRows.length ? (
              <div className="space-y-2">
                {taskRows.map((task, index) => {
                  const priority = String(
                    task?.priority || "medium"
                  ).toLowerCase();

                  return (
                    <button
                      type="button"
                      key={task?._id || task?.id || index}
                      onClick={() => (window.location.href = "/projects")}
                      className="w-full rounded-xl border border-white/[0.06] bg-[#0a1220] p-3 text-left transition hover:border-white/10 hover:bg-[#0c1726]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-slate-600" />

                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-white">
                            {task?.title ||
                              task?.name ||
                              "Untitled task"}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                priority === "high" ||
                                priority === "critical"
                                  ? "bg-red-400/10 text-red-300"
                                  : priority === "low"
                                  ? "bg-slate-400/10 text-slate-400"
                                  : "bg-amber-400/10 text-amber-300"
                              }`}
                            >
                              {priority}
                            </span>

                            {task?.dueDate || task?.deadline ? (
                              <span className="flex items-center gap-1 text-[9px] text-slate-600">
                                <Clock3 size={10} />
                                {new Date(
                                  task.dueDate || task.deadline
                                ).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
                <CheckCircle2
                  size={22}
                  className="mx-auto text-cyan-400/60"
                />
                <p className="mt-3 text-xs font-medium text-slate-500">
                  No open tasks.
                </p>
                <p className="mt-1 text-[10px] text-slate-700">
                  Your sprint is clear.
                </p>
              </div>
            )}
          </section>

          {/* ATTENTION */}
          <section className={`${CARD} p-5`}>
            <SectionTitle
              icon={Bell}
              title="Attention"
              subtitle="Signals worth checking."
            />

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => (window.location.href = "/messages")}
                className="flex w-full items-center justify-between rounded-xl bg-white/[0.025] p-3 text-left transition hover:bg-white/[0.04]"
              >
                <span className="text-xs text-slate-400">
                  Unread messages
                </span>
                <span className="text-sm font-bold text-white">
                  {data.unread}
                </span>
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "/notifications")}
                className="flex w-full items-center justify-between rounded-xl bg-white/[0.025] p-3 text-left transition hover:bg-white/[0.04]"
              >
                <span className="text-xs text-slate-400">
                  Notifications
                </span>
                <span className="text-sm font-bold text-white">
                  {data.notifications.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => (window.location.href = "/projects")}
                className="flex w-full items-center justify-between rounded-xl bg-white/[0.025] p-3 text-left transition hover:bg-white/[0.04]"
              >
                <span className="text-xs text-slate-400">
                  High priority work
                </span>
                <span
                  className={`text-sm font-bold ${
                    stats.urgent ? "text-amber-300" : "text-cyan-300"
                  }`}
                >
                  {stats.urgent}
                </span>
              </button>
            </div>
          </section>

          {/* SYSTEM HEALTH */}
          <section className={`${CARD} p-5`}>
            <SectionTitle
              icon={Server}
              title="System health"
              subtitle="Live reachability of dashboard services."
              action={
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${
                    overallHealth === "Operational"
                      ? "text-cyan-300"
                      : overallHealth === "Degraded"
                      ? "text-amber-300"
                      : "text-red-300"
                  }`}
                >
                  {overallHealth}
                </span>
              }
            />

            <div className="space-y-2">
              <ServiceRow
                icon={Database}
                label="Projects API"
                status={serviceState.projects}
              />
              <ServiceRow
                icon={Users}
                label="Connections API"
                status={serviceState.connections}
              />
              <ServiceRow
                icon={MessageSquare}
                label="Conversations API"
                status={serviceState.conversations}
              />
              <ServiceRow
                icon={Wifi}
                label="Messaging API"
                status={serviceState.messages}
              />
              <ServiceRow
                icon={Bell}
                label="Notifications API"
                status={serviceState.notifications}
              />
            </div>

            <div className="mt-4 flex items-start gap-2 text-[10px] leading-5 text-slate-600">
              <Activity size={12} className="mt-0.5 shrink-0 text-cyan-400/60" />
              Status reflects real API responses from this dashboard load.
            </div>
          </section>

          {/* WORKSPACE HEALTH */}
          <section className={`${CARD} p-5`}>
            <SectionTitle
              icon={Activity}
              title="Workspace health"
              subtitle="A compact read on current execution."
            />

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Task completion</span>
                  <span className="font-semibold text-white">
                    {data.tasks.length
                      ? Math.round(
                          (stats.completed / data.tasks.length) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                    style={{
                      width: `${
                        data.tasks.length
                          ? Math.round(
                              (stats.completed / data.tasks.length) * 100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <div className="text-lg font-black text-white">
                    {contribution.activeDays}
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-widest text-slate-600">
                    active days
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <div className="text-lg font-black text-cyan-300">
                    {contribution.peak}
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-widest text-slate-600">
                    peak day
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                  <div className="text-lg font-black text-white">
                    {stats.completed}
                  </div>
                  <div className="mt-0.5 text-[9px] uppercase tracking-widest text-slate-600">
                    shipped
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[10px] leading-5 text-slate-600">
                <Code2
                  size={12}
                  className="mt-0.5 shrink-0 text-cyan-400/70"
                />
                Contribution activity is derived from real workspace events.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

