import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  FolderKanban,
  GitBranch,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function getProjectId(project) {
  return (
    project?._id ||
    project?.id ||
    project?.projectId ||
    null
  );
}

function getProjectTitle(project) {
  return (
    project?.title ||
    project?.name ||
    "Untitled Project"
  );
}

function getProjectDescription(project) {
  return (
    project?.description ||
    project?.overview ||
    "A developer project built on the DevConnect platform."
  );
}

function getTechStack(project) {
  if (Array.isArray(project?.techStack)) {
    return project.techStack.filter(Boolean);
  }

  if (typeof project?.techStack === "string") {
    return project.techStack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getMemberCount(project) {
  if (Array.isArray(project?.members)) {
    return project.members.length;
  }

  return Number(
    project?.memberCount ||
      project?.membersCount ||
      0
  );
}

function getProjectStatus(project) {
  return (
    project?.status ||
    project?.projectStatus ||
    "open"
  );
}

function formatStatus(status) {
  const normalized = String(status)
    .trim()
    .toLowerCase();

  if (normalized === "in-progress") {
    return "IN PROGRESS";
  }

  if (normalized === "closed") {
    return "CLOSED";
  }

  return "OPEN";
}

function FeaturedProjectCard({ project }) {
  const navigate = useNavigate();

  const projectId = getProjectId(project);
  const title = getProjectTitle(project);
  const description = getProjectDescription(project);
  const techStack = getTechStack(project);
  const memberCount = getMemberCount(project);
  const status = formatStatus(
    getProjectStatus(project)
  );

  const githubRepo =
    project?.githubRepo ||
    project?.github ||
    project?.repository ||
    "";

  const liveLink =
    project?.liveLink ||
    project?.liveUrl ||
    project?.demoUrl ||
    "";

  const openWorkspace = () => {
    if (!projectId) return;

    navigate(`/workspace/${projectId}`);
  };

  const openProject = () => {
    if (!projectId) return;

    navigate(`/projects/${projectId}`);
  };

  return (
    <article className="group rounded-3xl border border-white/10 bg-[#0B1220] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-2xl hover:shadow-cyan-500/5">
      {/* HEADER */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={openProject}
          disabled={!projectId}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/15 disabled:cursor-default"
          aria-label={`Open ${title}`}
          title={`Open ${title}`}
        >
          <FolderKanban size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openProject}
              disabled={!projectId}
              className="truncate text-left text-lg font-bold text-white transition hover:text-cyan-300 disabled:cursor-default"
            >
              {title}
            </button>

            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${
                status === "CLOSED"
                  ? "border-slate-500/20 bg-slate-500/10 text-slate-400"
                  : status === "IN PROGRESS"
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              }`}
            >
              {status}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={openProject}
          disabled={!projectId}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300 sm:flex disabled:cursor-default"
          aria-label={`View ${title}`}
          title={`View project`}
        >
          <ArrowUpRight size={17} />
        </button>
      </div>

      {/* TECH STACK */}
      {techStack.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {techStack.slice(0, 10).map((tech, index) => (
            <span
              key={`${tech}-${index}`}
              className="rounded-lg border border-cyan-400/10 bg-cyan-400/5 px-2.5 py-1 text-[11px] font-medium text-cyan-300"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Users size={14} />
            {memberCount}{" "}
            {memberCount === 1 ? "Member" : "Members"}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <Code2 size={14} />
            {techStack.length}{" "}
            {techStack.length === 1
              ? "Technology"
              : "Technologies"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {githubRepo && (
            <a
              href={githubRepo}
              target="_blank"
              rel="noreferrer"
              onClick={(event) =>
                event.stopPropagation()
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <GitBranch size={14} />
              Repository
            </a>
          )}

          {liveLink && (
            <a
              href={liveLink}
              target="_blank"
              rel="noreferrer"
              onClick={(event) =>
                event.stopPropagation()
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
            >
              <ExternalLink size={14} />
              Live
            </a>
          )}

          <button
            type="button"
            onClick={openWorkspace}
            disabled={!projectId}
            className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Open Workspace
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedProjects({
  projects = [],
}) {
  const navigate = useNavigate();

  const safeProjects = Array.isArray(projects)
    ? projects
    : [];

  const visibleProjects = safeProjects.slice(0, 3);

  return (
    <section className="mt-8 rounded-[30px] border border-white/10 bg-[#111827] p-7 shadow-xl sm:p-8">
      {/* SECTION HEADER */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Featured Projects
            </h2>

            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
              {safeProjects.length} total
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            A focused selection of your latest engineering work.
          </p>
        </div>

        {safeProjects.length > 0 && (
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300"
          >
            View all projects
            <ArrowUpRight size={15} />
          </button>
        )}
      </div>

      {/* PROJECTS */}
      {visibleProjects.length > 0 ? (
        <div className="mt-7 space-y-4">
          {visibleProjects.map((project, index) => (
            <FeaturedProjectCard
              key={
                getProjectId(project) ||
                `project-${index}`
              }
              project={project}
            />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-3xl border border-dashed border-white/10 bg-[#0B1220] px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-400/5 text-cyan-300">
            <FolderKanban size={24} />
          </div>

          <h3 className="mt-5 text-lg font-semibold text-white">
            No featured projects yet
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your strongest engineering work will appear here once projects are available.
          </p>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="mt-6 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            Explore Projects
          </button>
        </div>
      )}

      {/* FOOTER */}
      {safeProjects.length > 3 && (
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
          <span className="text-xs text-slate-500">
            Showing 3 of {safeProjects.length} projects.
          </span>

          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="text-xs font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            Explore all ↗
          </button>
        </div>
      )}
    </section>
  );
}