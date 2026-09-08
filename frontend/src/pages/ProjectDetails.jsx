import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  ExternalLink,
  GitBranch,
  Globe,
  Layers3,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  UserPlus,
  XCircle,
  Zap,
} from "lucide-react";

function getApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  const fallback = "http://localhost:5000/api";
  let base = (configured || fallback).replace(/\/+$/, "");
  if (!base.endsWith("/api")) base = `${base}/api`;
  return base;
}

const API = getApiBase();

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

function idOf(value) {
  if (!value) return "";

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return String(
    value?._id ||
      value?.id ||
      value?.userId ||
      value?.user?._id ||
      value?.user?.id ||
      ""
  );
}

function extractArray(payload, preferredKeys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of [
    ...preferredKeys,
    "data",
    "items",
    "results",
    "records",
    "activities",
    "members",
    "tasks",
  ]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatDate(date) {
  if (!date) return "Unknown";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Unknown";

  return value.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatActivityDate(date) {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getActivityIcon(type) {
  const normalized = String(type || "").toLowerCase();

  if (normalized.includes("github")) return GitBranch;
  if (normalized.includes("member")) return Users;
  if (normalized.includes("task")) return CheckCircle2;
  if (normalized.includes("project")) return Layers3;

  return Activity;
}

function statusMeta(status) {
  const normalized = String(status || "open").toLowerCase();

  if (normalized === "closed") {
    return {
      label: "Closed",
      dot: "bg-red-400",
      text: "text-red-300",
      border: "border-red-400/20",
      background: "bg-red-400/[0.06]",
    };
  }

  if (
    normalized === "in-progress" ||
    normalized === "in_progress" ||
    normalized === "active"
  ) {
    return {
      label: normalized === "active" ? "Active" : "In progress",
      dot: "bg-cyan-400",
      text: "text-cyan-300",
      border: "border-cyan-400/20",
      background: "bg-cyan-400/[0.06]",
    };
  }

  return {
    label: "Open",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/20",
    background: "bg-emerald-400/[0.06]",
  };
}

function getProjectProgress(project, dashboard) {
  const candidates = [
    dashboard?.completionRate,
    project?.progress,
    project?.completionRate,
    project?.completion,
  ];

  const value = candidates.find(
    (candidate) => typeof candidate === "number" && Number.isFinite(candidate)
  );

  if (typeof value !== "number") return null;

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCurrentUserId() {
  const token = getToken();
  if (!token) return "";

  try {
    const payload = token.split(".")[1];
    if (!payload) return "";

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(
      normalized + "=".repeat((4 - (normalized.length % 4)) % 4)
    );

    const data = JSON.parse(decoded);
    return String(data?.id || data?._id || data?.userId || "");
  } catch {
    return "";
  }
}

function isProjectOwner(project, userId) {
  if (!project || !userId) return false;

  return [
    project.creator,
    project.createdBy,
    project.owner,
    project.user,
    project.author,
  ]
    .map(idOf)
    .filter(Boolean)
    .includes(userId);
}

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [members, setMembers] = useState([]);
  const [github, setGithub] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [workspaceNotice, setWorkspaceNotice] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [serviceHealth, setServiceHealth] = useState({
    dashboard: "idle",
    activity: "idle",
    members: "idle",
    github: "idle",
  });

  const currentUserId = getCurrentUserId();

  const authConfig = useMemo(() => {
    const token = getToken();

    return {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };
  }, []);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/projects/${id}`, {
        ...authConfig,
        timeout: 12000,
      });

      setProject(response.data);
      return true;
    } catch (err) {
      console.error("Project Load Error:", err);
      setError(getErrorMessage(err, "Unable to load this project."));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspace = async () => {
    try {
      setLoadingWorkspace(true);
      setWorkspaceNotice("");
      setServiceHealth({
        dashboard: "loading",
        activity: "loading",
        members: "loading",
        github: "loading",
      });

      const request = (path) =>
        axios.get(path, {
          ...authConfig,
          timeout: 12000,
        });

      const results = await Promise.allSettled([
        request(`${API}/projects/dashboard/${id}`),
        request(`${API}/projects/activity/${id}`),
        request(`${API}/projects/members/${id}`),
        request(`${API}/projects/${id}/github`),
      ]);

      const [dashboardResponse, activityResponse, membersResponse, githubResponse] = results;
      let failedServices = 0;
      const health = {};

      if (dashboardResponse.status === "fulfilled") {
        setDashboard(dashboardResponse.value.data);
        health.dashboard = "healthy";
      } else {
        failedServices += 1;
        health.dashboard = "degraded";
      }

      if (activityResponse.status === "fulfilled") {
        setActivity(extractArray(activityResponse.value.data, ["activities"]));
        health.activity = "healthy";
      } else {
        failedServices += 1;
        health.activity = "degraded";
      }

      if (membersResponse.status === "fulfilled") {
        setMembers(extractArray(membersResponse.value.data, ["members"]));
        health.members = "healthy";
      } else {
        failedServices += 1;
        health.members = "degraded";
      }

      if (githubResponse.status === "fulfilled") {
        setGithub(githubResponse.value.data?.repository || null);
        health.github = "healthy";
      } else {
        failedServices += 1;
        health.github = "degraded";
      }

      setServiceHealth(health);
      setLastRefreshedAt(new Date());

      if (failedServices > 0) {
        setWorkspaceNotice(
          `${failedServices} project service${failedServices === 1 ? "" : "s"} could not be reached. Showing available data.`
        );
      }
    } catch (err) {
      console.error("Workspace Load Error:", err);
      setWorkspaceNotice(
        "Some project intelligence could not be loaded. Showing available data."
      );
      setServiceHealth({
        dashboard: "degraded",
        activity: "degraded",
        members: "degraded",
        github: "degraded",
      });
    } finally {
      setLoadingWorkspace(false);
    }
  };

  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([loadProject(), loadWorkspace()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (project) loadWorkspace();
  }, [project?._id]);

  const tabs = [
    { id: "overview", label: "Overview", icon: Layers3 },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "team", label: "Team", icon: Users },
    { id: "github", label: "GitHub", icon: GitBranch },
  ];

  const completionRate = getProjectProgress(project, dashboard);

  const totalMembers =
    Number.isFinite(Number(dashboard?.totalMembers))
      ? Number(dashboard.totalMembers)
      : members.length > 0
        ? members.length
        : Array.isArray(project?.members)
          ? project.members.length
          : null;

  const totalTasks =
    Number.isFinite(Number(dashboard?.totalTasks))
      ? Number(dashboard.totalTasks)
      : null;

  const completedTasks =
    Number.isFinite(Number(dashboard?.completedTasks))
      ? Number(dashboard.completedTasks)
      : null;

  const projectMembers = members.length
    ? members
    : project?.members || [];

  const owner = project?.creator || project?.owner || project?.createdBy;

  const technologies = Array.from(
    new Set(
      (
        project?.techStack ||
        project?.technologies ||
        project?.stack ||
        []
      )
        .filter(Boolean)
        .map(String)
    )
  );

  const roles = Array.from(
    new Set(
      (project?.rolesNeeded || project?.roles || [])
        .filter(Boolean)
        .map(String)
    )
  );

  const ownerOfProject = isProjectOwner(project, currentUserId);

  if (loading) {
    return <ProjectDetailsSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[24px] border border-red-400/15 bg-[#111827] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-400/[0.06]">
            <XCircle size={23} className="text-red-400" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Project unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error || "This project could not be found."}
          </p>

          <Link
            to="/projects"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-[#061018] transition hover:bg-cyan-300"
          >
            <ArrowLeft size={16} />
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const meta = statusMeta(project.status);

  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-16">
      {/* TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-white/[0.03] hover:text-cyan-300"
        >
          <ArrowLeft size={16} />
          Projects
        </Link>

        <div className="hidden items-center gap-2 text-[11px] text-gray-600 md:flex">
          <span>Projects</span>
          <ChevronRight size={13} />
          <span className="max-w-[420px] truncate text-gray-400">
            {project.title}
          </span>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-[#111827] px-3 py-2 text-xs font-semibold text-gray-500 transition hover:border-cyan-400/20 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>

        <span className="text-[10px] text-gray-700">
          {lastRefreshedAt
            ? `Synced ${lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Live project data"}
        </span>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#111827]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(34,211,238,0.13),transparent_32%),radial-gradient(circle_at_92%_100%,rgba(99,102,241,0.10),transparent_32%)]" />

        <div className="relative p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${meta.border} ${meta.background} ${meta.text}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${meta.dot}`}
                  />
                  {meta.label}
                </span>

                {project.difficulty && (
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold text-gray-400">
                    {project.difficulty}
                  </span>
                )}

                {project.estimatedWeeks && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-600">
                    <Clock3 size={13} />
                    {project.estimatedWeeks}{" "}
                    {Number(project.estimatedWeeks) === 1
                      ? "week"
                      : "weeks"}
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-5xl text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                {project.title}
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-500 md:text-base">
                {project.description ||
                  "Collaborative engineering project on DevConnect."}
              </p>

              <div className="mt-6 flex flex-wrap gap-1.5">
                {technologies.slice(0, 10).map((technology) => (
                  <span
                    key={technology}
                    className="rounded-md border border-white/[0.07] bg-[#0b1220] px-2.5 py-1.5 text-[10px] font-medium text-gray-400"
                  >
                    {technology}
                  </span>
                ))}

                {technologies.length > 10 && (
                  <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[10px] text-gray-600">
                    +{technologies.length - 10} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {project.liveLink && (
                <ExternalAction
                  href={project.liveLink}
                  icon={Globe}
                  label="Live"
                />
              )}

              {project.githubRepo && (
                <ExternalAction
                  href={project.githubRepo}
                  icon={GitBranch}
                  label="Repository"
                />
              )}

              {project.creator?._id && (
                <Link
                  to={`/messages?userId=${project.creator._id}`}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-xs font-bold text-[#061018] transition hover:bg-cyan-300"
                >
                  <MessageSquare size={15} />
                  Discuss
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SIGNAL STRIP */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Team members"
          value={totalMembers === null ? "—" : totalMembers}
          icon={Users}
          detail="Project members"
        />

        <MetricCard
          label="Tasks"
          value={totalTasks === null ? "—" : totalTasks}
          icon={BarChart3}
          detail={
            totalTasks === null
              ? "Not reported"
              : `${completedTasks ?? 0} completed`
          }
        />

        <MetricCard
          label="Completion"
          value={completionRate === null ? "—" : `${completionRate}%`}
          icon={CheckCircle2}
          detail={completionRate === null ? "Not reported" : "Workspace progress"}
          progress={completionRate}
        />

        <MetricCard
          label="Activity"
          value={serviceHealth.activity === "degraded" ? "—" : activity.length}
          icon={Zap}
          detail={serviceHealth.activity === "degraded" ? "Service unavailable" : "Recorded project events"}
        />
      </section>

      {workspaceNotice && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.04] px-4 py-3 text-xs text-amber-200/70">
          <Zap size={14} className="shrink-0 text-amber-300" />
          {workspaceNotice}
        </div>
      )}

      {/* TABS */}
      <nav className="sticky top-0 z-20 -mx-1 overflow-x-auto border-y border-white/[0.06] bg-[#0b1220]/90 px-1 backdrop-blur-xl">
        <div className="flex min-w-max items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-3.5 text-xs font-semibold transition ${
                  active
                    ? "text-cyan-300"
                    : "text-gray-600 hover:text-gray-300"
                }`}
              >
                <Icon size={15} />
                {tab.label}

                {active && (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-5">
            <Section
              icon={Layers3}
              title="Project overview"
              subtitle="What the team is building"
            >
              <p className="whitespace-pre-line text-sm leading-7 text-gray-500 md:text-[15px]">
                {project.overview ||
                  project.description ||
                  "No project overview has been added yet."}
              </p>

              {roles.length > 0 && (
                <div className="mt-7 border-t border-white/[0.06] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                    Collaboration needs
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {roles.map((role) => (
                      <span
                        key={role}
                        className="rounded-md border border-cyan-400/10 bg-cyan-400/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-cyan-300"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            <Section
              icon={BarChart3}
              title="Execution"
              subtitle="Current engineering progress"
              action={
                loadingWorkspace ? (
                  <Loader2
                    size={17}
                    className="animate-spin text-gray-600"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {completionRate === null ? "—" : `${completionRate}%`}
                  </span>
                )
              }
            >
              <div className="mt-1">
                <div className="h-2 overflow-hidden rounded-full bg-[#0b1220]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                    style={{ width: `${completionRate ?? 0}%` }}
                  />
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-4">
                  <ProgressStat
                    label="Todo"
                    value={dashboard?.todoTasks ?? 0}
                    icon={Circle}
                  />
                  <ProgressStat
                    label="In progress"
                    value={dashboard?.inProgressTasks ?? 0}
                    icon={Loader2}
                  />
                  <ProgressStat
                    label="Review"
                    value={dashboard?.reviewTasks ?? 0}
                    icon={ShieldCheck}
                  />
                  <ProgressStat
                    label="Completed"
                    value={completedTasks}
                    icon={CheckCircle2}
                  />
                </div>
              </div>
            </Section>

            <Section
              icon={Activity}
              title="Recent activity"
              subtitle="Latest project events"
              action={
                activity.length > 5 ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("activity")}
                    className="text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
                  >
                    View all
                  </button>
                ) : null
              }
            >
              {loadingWorkspace ? (
                <InlineLoading label="Loading activity..." />
              ) : activity.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No activity yet"
                  description="Project events will appear here as the team works."
                  compact
                />
              ) : (
                <div className="space-y-1">
                  {activity.slice(0, 5).map((item, index) => (
                    <ActivityRow
                      key={item._id || item.id || `${item.createdAt}-${index}`}
                      activity={item}
                      Icon={getActivityIcon(item.type)}
                    />
                  ))}
                </div>
              )}
            </Section>
          </div>

          <aside className="space-y-5">
            <Section
              icon={ShieldCheck}
              title="Project owner"
              subtitle="Workspace leadership"
            >
              {owner ? (
                <div className="mt-5 flex items-center gap-3">
                  <Avatar name={owner.name} />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {owner.name || "Unknown developer"}
                    </p>

                    {owner.email && (
                      <p className="mt-1 truncate text-[11px] text-gray-600">
                        {owner.email}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-600">
                  Owner information is not available.
                </p>
              )}
            </Section>

            <Section
              icon={Users}
              title="Team"
              subtitle={`${totalMembers} contributor${
                totalMembers === 1 ? "" : "s"
              }`}
              action={
                <button
                  type="button"
                  onClick={() => setActiveTab("team")}
                  className="rounded-lg p-1.5 text-gray-600 transition hover:bg-white/[0.04] hover:text-gray-300"
                  aria-label="Open team"
                >
                  <MoreHorizontal size={17} />
                </button>
              }
            >
              {loadingWorkspace ? (
                <InlineLoading label="Loading team..." />
              ) : projectMembers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No team members"
                  description="Build the team by inviting developers."
                  compact
                />
              ) : (
                <>
                  <div className="mt-5 space-y-3">
                    {projectMembers.slice(0, 5).map((member, index) => {
                      const user = member?.user || member;

                      return (
                        <TeamRow
                          key={
                            user?._id ||
                            member?._id ||
                            `${user?.name || "member"}-${index}`
                          }
                          user={user}
                          role={member?.role}
                        />
                      );
                    })}
                  </div>

                  {projectMembers.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("team")}
                      className="mt-5 w-full rounded-xl border border-white/[0.07] py-2.5 text-xs font-semibold text-gray-500 transition hover:border-cyan-400/20 hover:text-cyan-300"
                    >
                      View all {projectMembers.length} members
                    </button>
                  )}
                </>
              )}
            </Section>

            <Section
              icon={GitBranch}
              title="GitHub"
              subtitle="Repository intelligence"
            >
              {github ? (
                <>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-[#0b1220]">
                      <GitBranch size={17} className="text-gray-300" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {repositoryName(github)}
                      </p>
                      <p className="mt-1 text-[10px] text-gray-600">
                        {github.defaultBranch || "main"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <GitHubStat label="Stars" value={github.stars == null ? "—" : github.stars} />
                    <GitHubStat label="Forks" value={github.forks == null ? "—" : github.forks} />
                    <GitHubStat label="Issues" value={github.issues == null ? "—" : github.issues} />
                    <GitHubStat label="Watchers" value={github.watchers == null ? "—" : github.watchers} />
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("github")}
                    className="mt-4 w-full rounded-xl border border-white/[0.07] py-2.5 text-xs font-semibold text-gray-400 transition hover:border-cyan-400/20 hover:text-cyan-300"
                  >
                    Repository details
                  </button>
                </>
              ) : (
                <EmptyState
                  icon={GitBranch}
                  title="No repository connected"
                  description="Connect GitHub to bring repository intelligence into this project."
                  compact
                />
              )}
            </Section>

            <section className="relative overflow-hidden rounded-[22px] border border-cyan-400/15 bg-cyan-400/[0.035] p-6">
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
                  <Sparkles size={18} className="text-cyan-300" />
                </div>

                <h3 className="mt-4 text-base font-bold text-white">
                  AI engineering workspace
                </h3>

                <p className="mt-2 text-xs leading-5 text-gray-600">
                  Architecture analysis, code review, documentation, and bug
                  investigation are designed to live alongside the project.
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-5 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] py-2.5 text-xs font-semibold text-cyan-300/70"
                >
                  <Sparkles size={14} />
                  AI workspace
                  <span className="text-[9px] uppercase tracking-[0.14em] text-cyan-500/60">
                    Coming next
                  </span>
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}

      {/* ACTIVITY */}
      {activeTab === "activity" && (
        <Section
          icon={Activity}
          title="Project activity"
          subtitle="Chronological engineering events recorded for this workspace"
        >
          {loadingWorkspace ? (
            <InlineLoading label="Loading activity..." />
          ) : activity.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="No activity recorded"
              description="As your team works on the project, important events will appear here."
            />
          ) : (
            <div className="relative mt-5">
              <div className="absolute bottom-0 left-[17px] top-0 w-px bg-white/[0.06]" />

              <div className="space-y-1">
                {activity.map((item, index) => (
                  <ActivityRow
                    key={item._id || item.id || `${item.createdAt}-${index}`}
                    activity={item}
                    Icon={getActivityIcon(item.type)}
                    detailed
                  />
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* TEAM */}
      {activeTab === "team" && (
        <Section
          icon={Users}
          title="Project team"
          subtitle="People collaborating on this project"
          action={
            ownerOfProject ? (
              <button
                type="button"
                disabled
                title="Invitation flow is not connected in this screen yet."
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-gray-600"
              >
                <UserPlus size={15} />
                Invite developer
              </button>
            ) : null
          }
        >
          {loadingWorkspace ? (
            <InlineLoading label="Loading team..." />
          ) : projectMembers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No team members"
              description="Build your project team by inviting developers."
            />
          ) : (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {projectMembers.map((member, index) => {
                const user = member?.user || member;

                return (
                  <div
                    key={
                      user?._id ||
                      member?._id ||
                      `${user?.name || "member"}-${index}`
                    }
                    className="rounded-2xl border border-white/[0.07] bg-[#0b1220] p-4 transition hover:border-cyan-400/15"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user?.name} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {user?.name || "Developer"}
                        </p>

                        {user?.email && (
                          <p className="mt-1 truncate text-[10px] text-gray-600">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                      <span className="rounded-md border border-cyan-400/10 bg-cyan-400/[0.04] px-2 py-1 text-[10px] font-medium capitalize text-cyan-300">
                        {member?.role || "member"}
                      </span>

                      {user?._id && (
                        <Link
                          to={`/developers/${user._id}`}
                          className="text-[10px] font-semibold text-gray-600 transition hover:text-cyan-300"
                        >
                          View profile
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      )}

      {/* GITHUB */}
      {activeTab === "github" && (
        <Section
          icon={GitBranch}
          title="GitHub repository"
          subtitle="Repository intelligence connected to this project"
        >
          {!github ? (
            <EmptyState
              icon={GitBranch}
              title="No repository connected"
              description="Connect a GitHub repository to bring engineering signals into DevConnect."
            />
          ) : (
            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-[#0b1220] p-5 md:p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                    <GitBranch size={21} className="text-gray-300" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-white">
                      {repositoryName(github)}
                    </h3>

                    <p className="mt-1 text-[11px] text-gray-600">
                      Default branch: {github.defaultBranch || "main"}
                    </p>
                  </div>
                </div>

                {github.htmlUrl && (
                  <a
                    href={github.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-semibold text-gray-400 transition hover:border-cyan-400/20 hover:text-cyan-300"
                  >
                    Open GitHub
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <GitHubStat label="Stars" value={github.stars == null ? "—" : github.stars} />
                <GitHubStat label="Forks" value={github.forks == null ? "—" : github.forks} />
                <GitHubStat label="Open issues" value={github.issues == null ? "—" : github.issues} />
                <GitHubStat label="Watchers" value={github.watchers == null ? "—" : github.watchers} />
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <InfoBox
                  label="Primary language"
                  value={github.language || "Not detected"}
                />
                <InfoBox
                  label="Last updated"
                  value={
                    github.updatedAt
                      ? formatDate(github.updatedAt)
                      : "Unknown"
                  }
                />
              </div>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}

function repositoryName(repository) {
  if (repository?.name) return repository.name;

  const url = repository?.htmlUrl || repository?.url;
  if (!url) return "Connected repository";

  return (
    String(url)
      .replace(/\/+$/, "")
      .split("/")
      .slice(-2)
      .join("/") || "Connected repository"
  );
}

function ExternalAction({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 text-xs font-semibold text-gray-400 transition hover:border-cyan-400/20 hover:bg-white/[0.04] hover:text-cyan-300"
    >
      <Icon size={15} />
      {label}
    </a>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}) {
  return (
    <section className="rounded-[22px] border border-white/[0.07] bg-[#111827] p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05]">
            <Icon size={16} className="text-cyan-400" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white">{title}</h2>
            <p className="mt-1 text-[10px] leading-4 text-gray-600">
              {subtitle}
            </p>
          </div>
        </div>

        {action}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
  progress,
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111827] px-5 py-4 transition hover:border-cyan-400/15">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600">
          {label}
        </span>
        <Icon size={15} className="text-cyan-400" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="text-2xl font-bold tracking-tight text-white">
          {value}
        </span>
        <span className="text-right text-[10px] leading-4 text-gray-600">
          {detail}
        </span>
      </div>

      {typeof progress === "number" && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#0b1220]">
          <div
            className="h-full rounded-full bg-cyan-400"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ProgressStat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0b1220] px-3.5 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-gray-600">{label}</span>
        <Icon size={13} className="text-gray-700" />
      </div>
      <p className="mt-2 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

function GitHubStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111827] px-3.5 py-3">
      <p className="text-[10px] text-gray-600">{label}</p>
      <p className="mt-1.5 text-base font-bold text-white">
        {formatNumber(value)}
      </p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111827] px-3.5 py-3">
      <p className="text-[10px] text-gray-600">{label}</p>
      <p className="mt-1.5 text-xs font-semibold text-gray-300">{value}</p>
    </div>
  );
}

function TeamRow({ user, role }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={user?.name} small />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-gray-300">
          {user?.name || "Developer"}
        </p>
        <p className="mt-0.5 text-[10px] capitalize text-gray-600">
          {role || "member"}
        </p>
      </div>

      <span
        className="shrink-0 rounded-md border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 text-[9px] font-medium text-gray-600"
        title="Project member"
      >
        Member
      </span>
    </div>
  );
}

function ActivityRow({
  activity,
  Icon,
  detailed = false,
}) {
  return (
    <div
      className={`relative flex gap-3 rounded-xl transition hover:bg-white/[0.025] ${
        detailed ? "p-3" : "p-2.5"
      }`}
    >
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-[#0b1220]">
        <Icon size={14} className="text-cyan-400" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-4">
          <p className="text-xs leading-5 text-gray-400">
            {activity?.message || "Project activity recorded."}
          </p>

          <span className="shrink-0 text-[10px] text-gray-700">
            {formatActivityDate(activity?.createdAt)}
          </span>
        </div>

        {detailed && activity?.user && (
          <div className="mt-2 flex items-center gap-2">
            <Avatar name={activity.user.name} small />
            <span className="text-[10px] text-gray-600">
              {activity.user.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name, small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] font-bold text-cyan-300 ${
        small ? "h-8 w-8 text-[10px]" : "h-11 w-11 text-sm"
      }`}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function InlineLoading({ label }) {
  return (
    <div className="flex items-center justify-center py-10 text-xs text-gray-600">
      <Loader2 size={16} className="mr-2 animate-spin" />
      {label}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  compact = false,
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-white/[0.07] bg-[#0b1220] text-center ${
        compact ? "px-4 py-8" : "px-6 py-14"
      }`}
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02]">
        <Icon size={18} className="text-gray-700" />
      </div>

      <h3 className="mt-3 text-xs font-semibold text-gray-300">
        {title}
      </h3>

      <p className="mx-auto mt-1.5 max-w-sm text-[10px] leading-5 text-gray-700">
        {description}
      </p>
    </div>
  );
}

function ProjectDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-5 pb-16">
      <div className="h-8 w-24 animate-pulse rounded-lg bg-[#111827]" />

      <div className="h-[300px] animate-pulse rounded-[26px] border border-white/[0.05] bg-[#111827]" />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[94px] animate-pulse rounded-2xl border border-white/[0.05] bg-[#111827]"
          />
        ))}
      </div>

      <div className="h-12 animate-pulse border-y border-white/[0.05] bg-[#0b1220]" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
        <div className="space-y-5">
          <div className="h-52 animate-pulse rounded-[22px] bg-[#111827]" />
          <div className="h-48 animate-pulse rounded-[22px] bg-[#111827]" />
        </div>
        <div className="space-y-5">
          <div className="h-36 animate-pulse rounded-[22px] bg-[#111827]" />
          <div className="h-56 animate-pulse rounded-[22px] bg-[#111827]" />
        </div>
      </div>
    </div>
  );
}

function formatNumber(value) {
  if (value === null || value === undefined || value === "") return 0;

  const number = Number(value);
  if (!Number.isFinite(number)) return value;

  return new Intl.NumberFormat("en-US", {
    notation: number >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(number);
}

export default ProjectDetails;
