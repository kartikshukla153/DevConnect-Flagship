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
  ShieldCheck,
  Sparkles,
  Users,
  UserPlus,
  XCircle,
  Zap,
} from "lucide-react";

const API = "http://localhost:5000/api";

function ProjectDetails() {
  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [activity, setActivity] = useState([]);
  const [members, setMembers] = useState([]);
  const [github, setGithub] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  const [error, setError] = useState("");

  const authConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
    [token]
  );

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    if (project) {
      loadWorkspace();
    }
  }, [project]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/projects/${id}`,
        authConfig
      );

      setProject(response.data);
    } catch (err) {
      console.error("Project Load Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load this project."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspace = async () => {
    try {
      setLoadingWorkspace(true);

      const [
        dashboardResponse,
        activityResponse,
        membersResponse,
        githubResponse,
      ] = await Promise.allSettled([
        axios.get(
          `${API}/projects/dashboard/${id}`,
          authConfig
        ),
        axios.get(
          `${API}/projects/activity/${id}`,
          authConfig
        ),
        axios.get(
          `${API}/projects/members/${id}`,
          authConfig
        ),
        axios.get(
          `${API}/projects/${id}/github`,
          authConfig
        ),
      ]);

      if (dashboardResponse.status === "fulfilled") {
        setDashboard(dashboardResponse.value.data);
      }

      if (activityResponse.status === "fulfilled") {
        setActivity(
          activityResponse.value.data.activities || []
        );
      }

      if (membersResponse.status === "fulfilled") {
        setMembers(
          membersResponse.value.data.members || []
        );
      }

      if (githubResponse.status === "fulfilled") {
        setGithub(
          githubResponse.value.data.repository || null
        );
      }
    } catch (err) {
      console.error("Workspace Load Error:", err);
    } finally {
      setLoadingWorkspace(false);
    }
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Layers3,
    },
    {
      id: "activity",
      label: "Activity",
      icon: Activity,
    },
    {
      id: "team",
      label: "Team",
      icon: Users,
    },
    {
      id: "github",
      label: "GitHub",
      icon: GitBranch,
    },
  ];

  const completionRate = dashboard?.completionRate ?? 0;

  const totalMembers =
    dashboard?.totalMembers ??
    project?.members?.length ??
    0;

  const totalTasks = dashboard?.totalTasks ?? 0;

  const completedTasks = dashboard?.completedTasks ?? 0;

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatActivityDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityIcon = (type) => {
    if (type?.includes("github")) {
      return GitBranch;
    }

    if (type?.includes("member")) {
      return Users;
    }

    if (type?.includes("task")) {
      return CheckCircle2;
    }

    if (type?.includes("project")) {
      return Layers3;
    }

    return Activity;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-8">
        <div className="h-6 w-24 animate-pulse rounded bg-[#111827]" />

        <div className="h-[280px] animate-pulse rounded-[32px] border border-white/5 bg-[#111827]" />

        <div className="grid gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-white/5 bg-[#111827]"
            />
          ))}
        </div>

        <div className="h-[500px] animate-pulse rounded-[28px] border border-white/5 bg-[#111827]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="max-w-md rounded-3xl border border-red-400/20 bg-red-400/5 p-10 text-center">
          <XCircle
            size={42}
            className="mx-auto text-red-400"
          />

          <h2 className="mt-5 text-2xl font-bold text-white">
            Project unavailable
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            {error || "This project could not be found."}
          </p>

          <Link
            to="/projects"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black transition hover:bg-cyan-300"
          >
            <ArrowLeft size={17} />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 pb-16">
      {/* TOP NAVIGATION */}

      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-cyan-300"
        >
          <ArrowLeft size={17} />
          Projects
        </Link>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Workspace</span>
          <ChevronRight size={13} />
          <span className="text-gray-300">
            {project.title}
          </span>
        </div>
      </div>

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#111827]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,0.16),transparent_35%),radial-gradient(circle_at_90%_100%,rgba(99,102,241,0.14),transparent_35%)]" />

        <div className="relative p-8 md:p-10 lg:p-12">
          <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                  {project.status || "Active"}
                </span>

                {project.difficulty && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300">
                    {project.difficulty}
                  </span>
                )}

                {project.estimatedWeeks && (
                  <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                    <Clock3 size={14} />
                    {project.estimatedWeeks} week
                    {project.estimatedWeeks === 1 ? "" : "s"}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                {project.title}
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-gray-400 md:text-lg">
                {project.description ||
                  "Collaborative engineering project on DevConnect."}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {project.techStack
                  ?.slice(0, 8)
                  .map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-white/10 bg-[#0B1220] px-3 py-1.5 text-xs font-medium text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              {project.liveLink && (
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  <Globe size={17} />
                  Live
                </a>
              )}

              {project.githubRepo && (
                <a
                  href={project.githubRepo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  <GitBranch size={17} />
                  Repository
                </a>
              )}

              <Link
                to={`/messages?userId=${project.creator?._id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300"
              >
                <MessageSquare size={17} />
                Discuss
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KEY METRICS */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Team Members"
          value={totalMembers}
          icon={Users}
          description="Active contributors"
        />

        <MetricCard
          label="Total Tasks"
          value={totalTasks}
          icon={BarChart3}
          description={`${completedTasks} completed`}
        />

        <MetricCard
          label="Completion"
          value={`${completionRate}%`}
          icon={CheckCircle2}
          description="Project progress"
          progress={completionRate}
        />

        <MetricCard
          label="Activity"
          value={activity.length}
          icon={Zap}
          description="Recorded events"
        />
      </section>

      {/* TABS */}

      <div className="sticky top-0 z-20 overflow-x-auto border-b border-white/10 bg-[#0B1220]/90 backdrop-blur-xl">
        <div className="flex min-w-max items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-4 text-sm font-medium transition ${
                  active
                    ? "text-cyan-300"
                    : "text-gray-500 hover:text-gray-200"
                }`}
              >
                <Icon size={16} />
                {tab.label}

                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* OVERVIEW */}

      {activeTab === "overview" && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {/* ABOUT */}

            <section className="rounded-[28px] border border-white/10 bg-[#111827] p-7 md:p-8">
              <SectionHeading
                icon={Layers3}
                title="Project Overview"
                subtitle="What the team is building"
              />

              <p className="mt-7 whitespace-pre-line text-sm leading-8 text-gray-400 md:text-base">
                {project.overview ||
                  project.description ||
                  "No project overview has been added yet."}
              </p>
            </section>

            {/* TASK PROGRESS */}

            <section className="rounded-[28px] border border-white/10 bg-[#111827] p-7 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <SectionHeading
                  icon={BarChart3}
                  title="Execution"
                  subtitle="Current engineering progress"
                />

                <span className="text-2xl font-bold text-white">
                  {completionRate}%
                </span>
              </div>

              <div className="mt-8 h-3 overflow-hidden rounded-full bg-[#0B1220]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                  style={{
                    width: `${Math.min(completionRate, 100)}%`,
                  }}
                />
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-4">
                <ProgressStat
                  label="Todo"
                  value={dashboard?.todoTasks ?? 0}
                  icon={Circle}
                />

                <ProgressStat
                  label="In Progress"
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
            </section>

            {/* RECENT ACTIVITY */}

            <section className="rounded-[28px] border border-white/10 bg-[#111827] p-7 md:p-8">
              <div className="flex items-center justify-between">
                <SectionHeading
                  icon={Activity}
                  title="Recent Activity"
                  subtitle="Latest project events"
                />

                <button
                  onClick={() => setActiveTab("activity")}
                  className="text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
                >
                  View all
                </button>
              </div>

              <div className="mt-7">
                {activity.length === 0 ? (
                  <EmptyState
                    icon={Activity}
                    title="No activity yet"
                    description="Project events will appear here as the team works."
                  />
                ) : (
                  <div className="space-y-1">
                    {activity.slice(0, 5).map((item) => {
                      const Icon = getActivityIcon(item.type);

                      return (
                        <ActivityRow
                          key={item._id}
                          activity={item}
                          Icon={Icon}
                          formatDate={formatActivityDate}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}

          <div className="space-y-6">
            {/* PROJECT OWNER */}

            <section className="rounded-[28px] border border-white/10 bg-[#111827] p-7">
              <SectionHeading
                icon={ShieldCheck}
                title="Project Owner"
                subtitle="Workspace leadership"
              />

              <div className="mt-7 flex items-center gap-4">
                <Avatar name={project.creator?.name} />

                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">
                    {project.creator?.name || "Unknown developer"}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {project.creator?.email || ""}
                  </p>
                </div>
              </div>
            </section>

            {/* TEAM */}

            <section className="rounded-[28px] border border-white/10 bg-[#111827] p-7">
              <div className="flex items-center justify-between">
                <SectionHeading
                  icon={Users}
                  title="Team"
                  subtitle={`${totalMembers} contributor${
                    totalMembers === 1 ? "" : "s"
                  }`}
                />

                <button
                  onClick={() => setActiveTab("team")}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-white/5 hover:text-white"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="mt-7 space-y-4">
                {(members.length ? members : project.members || [])
                  .slice(0, 5)
                  .map((member) => {
                    const user = member.user || member;

                    return (
                      <div
                        key={user._id || member._id}
                        className="flex items-center gap-3"
                      >
                        <Avatar name={user.name} small />

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-200">
                            {user.name}
                          </p>

                          <p className="text-xs capitalize text-gray-500">
                            {member.role || "member"}
                          </p>
                        </div>

                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      </div>
                    );
                  })}

                {members.length === 0 &&
                  (!project.members ||
                    project.members.length === 0) && (
                    <p className="text-sm text-gray-500">
                      No members found.
                    </p>
                  )}
              </div>

              <button
                onClick={() => setActiveTab("team")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-gray-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
              >
                <Users size={16} />
                Manage Team
              </button>
            </section>

            {/* GITHUB */}

            <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[#111827]">
              <div className="border-b border-white/10 p-7">
                <SectionHeading
                  icon={GitBranch}
                  title="GitHub"
                  subtitle="Repository intelligence"
                />
              </div>

              <div className="p-7">
                {github ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5">
                        <GitBranch
                          size={20}
                          className="text-gray-300"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {github.htmlUrl
                            ?.split("/")
                            .slice(-2)
                            .join("/")}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {github.defaultBranch || "main"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <GitHubStat
                        label="Stars"
                        value={github.stars ?? 0}
                      />

                      <GitHubStat
                        label="Forks"
                        value={github.forks ?? 0}
                      />

                      <GitHubStat
                        label="Issues"
                        value={github.issues ?? 0}
                      />

                      <GitHubStat
                        label="Watchers"
                        value={github.watchers ?? 0}
                      />
                    </div>

                    <button
                      onClick={() => setActiveTab("github")}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm font-medium text-gray-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
                    >
                      <GitBranch size={16} />
                      Repository Details
                    </button>
                  </>
                ) : (
                  <div className="text-center">
                    <GitBranch
                      size={32}
                      className="mx-auto text-gray-600"
                    />

                    <p className="mt-4 text-sm font-medium text-gray-300">
                      No repository connected
                    </p>

                    <p className="mt-2 text-xs leading-5 text-gray-500">
                      Connect GitHub to bring repository
                      intelligence into the workspace.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* AI */}

            <section className="relative overflow-hidden rounded-[28px] border border-cyan-400/20 bg-cyan-400/5 p-7">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                  <Sparkles
                    size={20}
                    className="text-cyan-300"
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  AI Engineering Workspace
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  Analyze architecture, review code,
                  generate documentation and investigate
                  bugs directly from the project workspace.
                </p>

                <button
                  disabled
                  className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 py-3 text-sm font-semibold text-cyan-300"
                >
                  <Sparkles size={16} />
                  AI Workspace
                  <span className="text-[10px] uppercase tracking-widest text-cyan-500">
                    Next
                  </span>
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ACTIVITY */}

      {activeTab === "activity" && (
        <section className="rounded-[28px] border border-white/10 bg-[#111827] p-7 md:p-9">
          <SectionHeading
            icon={Activity}
            title="Project Activity"
            subtitle="A chronological record of engineering events"
          />

          <div className="mt-8">
            {loadingWorkspace ? (
              <div className="flex items-center justify-center py-20 text-gray-500">
                <Loader2
                  size={22}
                  className="mr-3 animate-spin"
                />
                Loading activity...
              </div>
            ) : activity.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="No activity recorded"
                description="As your team works on the project, important events will appear here."
              />
            ) : (
              <div className="relative">
                <div className="absolute bottom-0 left-[19px] top-0 w-px bg-white/10" />

                <div className="space-y-7">
                  {activity.map((item) => {
                    const Icon = getActivityIcon(item.type);

                    return (
                      <div
                        key={item._id}
                        className="relative flex gap-5"
                      >
                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#111827]">
                          <Icon
                            size={17}
                            className="text-cyan-400"
                          />
                        </div>

                        <div className="flex-1 rounded-2xl border border-white/5 bg-[#0B1220] p-5">
                          <div className="flex flex-col justify-between gap-2 md:flex-row">
                            <p className="text-sm font-medium leading-6 text-gray-200">
                              {item.message ||
                                "Project activity recorded."}
                            </p>

                            <span className="shrink-0 text-xs text-gray-600">
                              {formatActivityDate(
                                item.createdAt
                              )}
                            </span>
                          </div>

                          {item.user && (
                            <div className="mt-4 flex items-center gap-2">
                              <Avatar
                                name={item.user.name}
                                small
                              />

                              <span className="text-xs text-gray-500">
                                {item.user.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TEAM */}

      {activeTab === "team" && (
        <section className="rounded-[28px] border border-white/10 bg-[#111827] p-7 md:p-9">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionHeading
              icon={Users}
              title="Project Team"
              subtitle="People collaborating on this project"
            />

            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-cyan-300">
              <UserPlus size={17} />
              Invite Developer
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(members.length
              ? members
              : project.members || []
            ).map((member) => {
              const user = member.user || member;

              return (
                <div
                  key={user._id || member._id}
                  className="rounded-2xl border border-white/10 bg-[#0B1220] p-5 transition hover:border-cyan-400/20"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={user.name} />

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">
                        {user.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium capitalize text-cyan-300">
                      {member.role || "member"}
                    </span>

                    <Link
                      to={`/developers/${user._id}`}
                      className="text-xs font-medium text-gray-500 transition hover:text-cyan-300"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {members.length === 0 &&
            (!project.members ||
              project.members.length === 0) && (
              <EmptyState
                icon={Users}
                title="No team members"
                description="Build your project team by inviting developers."
              />
            )}
        </section>
      )}

      {/* GITHUB */}

      {activeTab === "github" && (
        <section className="rounded-[28px] border border-white/10 bg-[#111827] p-7 md:p-9">
          <SectionHeading
            icon={GitBranch}
            title="GitHub Repository"
            subtitle="Repository intelligence connected to this project"
          />

          {!github ? (
            <EmptyState
              icon={GitBranch}
              title="No repository connected"
              description="Connect a GitHub repository to start bringing engineering signals into DevConnect."
            />
          ) : (
            <div className="mt-8">
              <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-6">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <GitBranch
                        size={28}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-white">
                        {github.htmlUrl
                          ?.split("/")
                          .slice(-2)
                          .join("/")}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Default branch:{" "}
                        {github.defaultBranch || "main"}
                      </p>
                    </div>
                  </div>

                  {github.htmlUrl && (
                    <a
                      href={github.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
                    >
                      Open GitHub
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <GitHubStat
                    label="Stars"
                    value={github.stars ?? 0}
                  />

                  <GitHubStat
                    label="Forks"
                    value={github.forks ?? 0}
                  />

                  <GitHubStat
                    label="Open Issues"
                    value={github.issues ?? 0}
                  />

                  <GitHubStat
                    label="Watchers"
                    value={github.watchers ?? 0}
                  />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <InfoBox
                    label="Primary Language"
                    value={
                      github.language || "Not detected"
                    }
                  />

                  <InfoBox
                    label="Last Updated"
                    value={
                      github.updatedAt
                        ? formatDate(github.updatedAt)
                        : "Unknown"
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/5">
        <Icon
          size={18}
          className="text-cyan-400"
        />
      </div>

      <div>
        <h2 className="font-bold text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  progress,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 transition hover:border-cyan-400/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {label}
        </span>

        <Icon
          size={17}
          className="text-cyan-400"
        />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <span className="text-3xl font-bold text-white">
          {value}
        </span>

        <span className="text-xs text-gray-600">
          {description}
        </span>
      </div>

      {typeof progress === "number" && (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#0B1220]">
          <div
            className="h-full rounded-full bg-cyan-400"
            style={{
              width: `${Math.min(progress, 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function ProgressStat({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0B1220] p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {label}
        </span>

        <Icon
          size={15}
          className="text-gray-500"
        />
      </div>

      <p className="mt-3 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function GitHubStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111827] p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#111827] p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-gray-200">
        {value}
      </p>
    </div>
  );
}

function Avatar({ name, small = false }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 font-bold text-cyan-300 ${
        small
          ? "h-9 w-9 text-xs"
          : "h-12 w-12 text-base"
      }`}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function ActivityRow({
  activity,
  Icon,
  formatDate,
}) {
  return (
    <div className="flex gap-4 rounded-xl p-3 transition hover:bg-white/[0.03]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-400/5">
        <Icon
          size={16}
          className="text-cyan-400"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-gray-300">
          {activity.message ||
            "Project activity recorded."}
        </p>

        <p className="mt-1 text-xs text-gray-600">
          {formatDate(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
        <Icon
          size={22}
          className="text-gray-500"
        />
      </div>

      <h3 className="mt-4 font-semibold text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default ProjectDetails;