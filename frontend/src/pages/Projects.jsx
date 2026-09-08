import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowDownUp,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Code2,
  FolderKanban,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function getApiBase() {
  const configured = import.meta.env.VITE_API_URL?.trim();
  const fallback = "http://localhost:5000/api";
  let base = (configured || fallback).replace(/\/+$/, "");
  if (!base.endsWith("/api")) base = `${base}/api`;
  return base;
}

const API = `${getApiBase()}/projects`;

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

function extractProjects(payload) {
  if (Array.isArray(payload)) return payload;

  for (const key of ["projects", "data", "items", "results", "records"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
}

function normalizeProject(project) {
  return {
    ...project,
    _id: project?._id || project?.id,
    title: project?.title || project?.name || "Untitled project",
    description:
      project?.description || "No project description available yet.",
    techStack:
      project?.techStack ||
      project?.technologies ||
      project?.stack ||
      [],
    members:
      project?.members ||
      project?.teamMembers ||
      project?.collaborators ||
      [],
    rolesNeeded: project?.rolesNeeded || project?.roles || [],
    status: String(project?.status || "open").toLowerCase(),
  };
}

function isMine(project, userId) {
  if (!project || !userId) return false;

  const ownerIds = [
    project.creator,
    project.createdBy,
    project.owner,
    project.user,
    project.author,
  ]
    .map(idOf)
    .filter(Boolean);

  if (ownerIds.includes(userId)) return true;

  return (project.members || []).some((member) => {
    return idOf(member?.user || member?.userId || member) === userId;
  });
}

function getProgress(project) {
  const candidates = [
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

function statusMeta(status) {
  const normalized = String(status || "open").toLowerCase();

  if (normalized === "closed") {
    return {
      label: "Closed",
      dot: "bg-red-400",
      text: "text-red-300",
      border: "border-red-400/15",
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
      border: "border-cyan-400/15",
      background: "bg-cyan-400/[0.06]",
    };
  }

  return {
    label: "Open",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-400/15",
    background: "bg-emerald-400/[0.06]",
  };
}

function sortProjects(projects, sort) {
  const data = [...projects];

  if (sort === "recent") {
    return data.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
  }

  if (sort === "title") {
    return data.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sort === "team") {
    return data.sort(
      (a, b) =>
        (b.members?.length || 0) - (a.members?.length || 0)
    );
  }

  return data;
}

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [scope, setScope] = useState("all");
  const [sort, setSort] = useState("recent");

  const currentUserId = getCurrentUserId();

  const fetchProjects = async ({ silent = false } = {}) => {
    const token = getToken();

    if (!silent) setLoading(true);
    setRefreshing(true);
    setError("");

    try {
      const response = await axios.get(API, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const normalized = extractProjects(response.data)
        .map(normalizeProject)
        .filter((project) => project._id);

      setProjects(normalized);
    } catch (err) {
      console.error("Projects Load Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // The token can change after login without this page remounting.
    const handleStorage = () => fetchProjects({ silent: true });
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    let data = projects;

    if (scope === "mine") {
      data = currentUserId
        ? data.filter((project) => isMine(project, currentUserId))
        : [];
    }

    if (status !== "all") {
      data = data.filter((project) => {
        const normalized = String(project.status || "").toLowerCase();

        if (status === "open") {
          return normalized === "open";
        }

        if (status === "in-progress") {
          return (
            normalized === "in-progress" ||
            normalized === "in_progress" ||
            normalized === "active"
          );
        }

        return normalized === "closed";
      });
    }

    if (query) {
      data = data.filter((project) => {
        const haystack = [
          project.title,
          project.description,
          ...(project.techStack || []),
          ...(project.rolesNeeded || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      });
    }

    return sortProjects(data, sort);
  }, [projects, search, status, scope, sort, currentUserId]);

  const stats = useMemo(() => {
    const active = projects.filter((project) => {
      const value = String(project.status || "").toLowerCase();
      return value === "open" || value === "active" || value === "in-progress";
    }).length;

    const contributors = projects.reduce(
      (total, project) => total + (project.members?.length || 0),
      0
    );

    const roles = projects.reduce(
      (total, project) => total + (project.rolesNeeded?.length || 0),
      0
    );

    const progressed = projects.filter(
      (project) => getProgress(project) !== null
    );

    const averageProgress =
      progressed.length > 0
        ? Math.round(
            progressed.reduce(
              (total, project) => total + getProgress(project),
              0
            ) / progressed.length
          )
        : null;

    return {
      total: projects.length,
      active,
      contributors,
      roles,
      averageProgress,
    };
  }, [projects]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-7 pb-16">
      {/* PAGE HEADER */}
      <header className="flex flex-col gap-5 border-b border-white/[0.06] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            Engineering workspace
          </div>

          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Projects
            </h1>

            {!loading && (
              <span className="text-sm text-gray-500">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </span>
            )}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 md:text-base">
            Discover, organize, and execute software projects with a real engineering workspace.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => fetchProjects({ silent: true })}
            disabled={refreshing}
            aria-label="Refresh projects"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-4 text-sm font-medium text-gray-300 transition hover:border-cyan-400/20 hover:bg-white/[0.04] hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/projects/create")}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-cyan-400 px-4.5 text-sm font-bold text-[#061018] shadow-[0_8px_30px_rgba(34,211,238,0.12)] transition hover:bg-cyan-300 hover:shadow-[0_10px_34px_rgba(34,211,238,0.18)]"
          >
            <Plus size={17} />
            Create project
          </button>
        </div>
      </header>

      {/* ENGINEERING SNAPSHOT */}
      {!loading && projects.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SnapshotCard
            icon={FolderKanban}
            label="Projects"
            value={stats.total}
            detail={`${stats.active} currently active`}
          />
          <SnapshotCard
            icon={Users}
            label="Member slots"
            value={stats.contributors}
            detail="Across visible projects"
          />
          <SnapshotCard
            icon={Code2}
            label="Open roles"
            value={stats.roles}
            detail="Collaboration opportunities"
          />
          <SnapshotCard
            icon={Zap}
            label="Tracked progress"
            value={
              stats.averageProgress === null
                ? "—"
                : `${stats.averageProgress}%`
            }
            detail={
              stats.averageProgress === null
                ? "Not exposed by project API"
                : "Average of reported progress"
            }
          />
        </section>
      )}

      {/* TOOLBAR */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0f1726] p-2">
        <div className="flex flex-col gap-2 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by project, technology, or role..."
              className="h-11 w-full rounded-xl border border-transparent bg-[#0b1220] pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-cyan-400/25 focus:bg-[#0d1524]"
            />
          </div>

          <FilterSelect
            value={scope}
            onChange={setScope}
            ariaLabel="Project scope"
          >
            <option value="all">All projects</option>
            <option value="mine">My projects</option>
          </FilterSelect>

          <FilterSelect
            value={status}
            onChange={setStatus}
            ariaLabel="Project status"
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In progress</option>
            <option value="closed">Closed</option>
          </FilterSelect>

          <FilterSelect
            value={sort}
            onChange={setSort}
            ariaLabel="Project sort order"
            icon
          >
            <option value="recent">Recently updated</option>
            <option value="title">Project name</option>
            <option value="team">Team size</option>
          </FilterSelect>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3.5 text-sm text-red-200">
          <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Projects could not be fully loaded</p>
            <p className="mt-1 text-red-200/60">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchProjects()}
            className="shrink-0 rounded-lg border border-red-400/15 px-3 py-1.5 text-xs font-semibold text-red-200 transition hover:bg-red-400/10"
          >
            Retry
          </button>
        </div>
      )}

      {/* CONTENT */}
      {loading ? (
        <ProjectGridSkeleton />
      ) : filteredProjects.length === 0 ? (
        <EmptyProjects
          hasProjects={projects.length > 0}
          hasSearch={Boolean(search.trim())}
          hasFilter={status !== "all" || scope !== "all"}
          onClear={() => {
            setSearch("");
            setStatus("all");
            setScope("all");
          }}
          onCreate={() => navigate("/projects/create")}
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4 px-1">
            <div>
              <p className="text-sm font-semibold text-white">
                {scope === "mine" ? "Your projects" : "Project directory"}
              </p>
              <p className="mt-1 text-xs text-gray-600">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "result" : "results"}
                {search.trim() ? ` for “${search.trim()}”` : ""}
              </p>
            </div>

            {filteredProjects.length !== projects.length && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                  setScope("all");
                }}
                className="text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SnapshotCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#111827] px-5 py-4 transition hover:border-cyan-400/15">
      <div className="flex items-center justify-between gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05]">
          <Icon size={16} className="text-cyan-400" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-600">
          {label}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="text-2xl font-bold tracking-tight text-white">
          {value}
        </span>
        <span className="text-right text-[11px] leading-4 text-gray-600">
          {detail}
        </span>
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
  ariaLabel,
  icon = false,
}) {
  return (
    <div className="relative shrink-0">
      {icon && (
        <ArrowDownUp
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
        />
      )}
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 min-w-[145px] appearance-none rounded-xl border border-white/[0.06] bg-[#0b1220] pr-9 text-sm text-gray-300 outline-none transition hover:border-white/10 focus:border-cyan-400/25 ${
          icon ? "pl-9" : "pl-4"
        }`}
      >
        {children}
      </select>
    </div>
  );
}

function ProjectCard({ project, currentUserId }) {
  const meta = statusMeta(project.status);
  const progress = getProgress(project);
  const owned = isMine(project, currentUserId);

  const tech = Array.from(
    new Set((project.techStack || []).filter(Boolean).map(String))
  );

  const roles = Array.from(
    new Set((project.rolesNeeded || []).filter(Boolean).map(String))
  );

  const visibleTech = tech.slice(0, 5);
  const remainingTech = Math.max(0, tech.length - visibleTech.length);

  return (
    <article className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#111827] transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-[#121b2b]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/0 to-transparent transition group-hover:via-cyan-400/50" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-[#0b1220] text-cyan-400">
              <Layers3 size={18} />
            </div>

            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                {owned && (
                  <span className="rounded-md border border-cyan-400/15 bg-cyan-400/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-cyan-300">
                    Yours
                  </span>
                )}
                <span className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-gray-600">
                  Workspace project
                </span>
              </div>

              <h2 className="line-clamp-2 text-[17px] font-bold leading-6 text-white">
                {project.title}
              </h2>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${meta.border} ${meta.background} ${meta.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>

        <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-500">
          {project.description}
        </p>

        {progress !== null ? (
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.1em]">
              <span className="text-gray-600">Reported progress</span>
              <span className="text-gray-400">{progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#0b1220]">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-2 text-[11px] text-gray-600">
            <CheckCircle2 size={13} className="text-gray-700" />
            Engineering progress is tracked inside the workspace
          </div>
        )}

        <div className="mt-5 min-h-[52px]">
          {visibleTech.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {visibleTech.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-white/[0.07] bg-[#0b1220] px-2 py-1 text-[10px] font-medium text-gray-400"
                >
                  {item}
                </span>
              ))}

              {remainingTech > 0 && (
                <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[10px] font-medium text-gray-600">
                  +{remainingTech}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[11px] text-gray-700">
              No technology stack specified
            </span>
          )}
        </div>

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4 text-xs text-gray-500">
              <Signal
                icon={Users}
                value={project.members?.length || 0}
                label="members"
              />

              <Signal
                icon={Code2}
                value={roles.length}
                label="roles"
              />

              {project.estimatedWeeks ? (
                <Signal
                  icon={Clock3}
                  value={project.estimatedWeeks}
                  label={
                    Number(project.estimatedWeeks) === 1 ? "week" : "weeks"
                  }
                />
              ) : null}
            </div>

            <Link
              to={`/projects/${project._id}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-cyan-400 transition hover:bg-cyan-400/[0.07] hover:text-cyan-300"
            >
              Open
              <ArrowRight size={14} />
            </Link>
          </div>

          {roles.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-600">
              <Code2 size={12} />
              <span className="truncate">
                Seeking {roles.slice(0, 2).join(" · ")}
                {roles.length > 2 ? ` +${roles.length - 2}` : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Signal({ icon: Icon, value, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={13} className="text-gray-600" />
      <span className="text-gray-400">{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

function ProjectGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-[330px] animate-pulse rounded-[22px] border border-white/[0.06] bg-[#111827]"
        />
      ))}
    </div>
  );
}

function EmptyProjects({
  hasProjects,
  hasSearch,
  hasFilter,
  onClear,
  onCreate,
}) {
  if (hasProjects && (hasSearch || hasFilter)) {
    return (
      <div className="rounded-[22px] border border-dashed border-white/[0.09] bg-[#0f1726] px-6 py-16 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07] bg-[#111827]">
          <Search size={20} className="text-gray-600" />
        </div>
        <h2 className="mt-5 text-lg font-bold text-white">
          No matching projects
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
          Nothing in the current project directory matches those search or
          filter conditions.
        </p>
        <button
          type="button"
          onClick={onClear}
          className="mt-6 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:border-cyan-400/20 hover:text-cyan-300"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-dashed border-white/[0.09] bg-[#0f1726] px-6 py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.05]">
        <FolderKanban size={21} className="text-cyan-400" />
      </div>
      <h2 className="mt-5 text-lg font-bold text-white">
        No projects yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
        Start an engineering workspace and bring other developers into the
        build.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-bold text-[#061018] transition hover:bg-cyan-300"
      >
        <Plus size={16} />
        Create project
      </button>
    </div>
  );
}

export default Projects;
