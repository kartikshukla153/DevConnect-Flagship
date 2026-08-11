import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";

import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import WorkspaceToolbar from "../components/workspace/WorkspaceToolbar";
import WorkspaceSidebar from "../components/workspace/WorkspaceSidebar";
import WorkspaceRightSidebar from "../components/workspace/WorkspaceRightSidebar";
import WorkspaceStats from "../components/workspace/WorkspaceStats";

import KanbanBoard from "../components/workspace/KanbanBoard";

import CreateTaskModal from "../components/workspace/CreateTaskModal";
import TaskDetailsDrawer from "../components/workspace/TaskDetailsDrawer";

import InviteMemberModal from "../components/workspace/InviteMemberModal";
import EditProjectModal from "../components/workspace/EditProjectModal";

import ProjectMembersCard from "../components/workspace/ProjectMembersCard";
import ActivityFeed from "../components/workspace/ActivityFeed";
import GitHubRepositoryCard from "../components/workspace/GitHubRepositoryCard";

import {
  connectProjectSocket,
} from "../socket/projectSocket";

const API = "http://localhost:5000/api";

function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [openCreateModal, setOpenCreateModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [inviteOpen, setInviteOpen] =
    useState(false);

  const [editProjectOpen, setEditProjectOpen] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  /*
   * ============================
   * LOAD WORKSPACE
   * ============================
   */

  const loadWorkspace = useCallback(
    async ({ initial = false } = {}) => {
      if (!id || !token) return;

      try {
        if (initial) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [projectRes, taskRes] =
          await Promise.all([
            axios.get(
              `${API}/projects/${id}`,
              {
                headers,
              }
            ),

            axios.get(
              `${API}/tasks/project/${id}`,
              {
                headers,
              }
            ),
          ]);

        setProject(projectRes.data);

        setTasks(
          Array.isArray(taskRes.data?.tasks)
            ? taskRes.data.tasks
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load workspace:",
          err
        );

        const status =
          err.response?.status;

        if (
          status === 401 ||
          status === 403
        ) {
          setError(
            "Your session has expired. Please log in again."
          );
        } else if (status === 404) {
          setError(
            "This project could not be found."
          );
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load the workspace. Please try again."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, token]
  );

  /*
   * ============================
   * INITIAL LOAD
   * ============================
   */

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;

      await loadWorkspace({
        initial: true,
      });
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [loadWorkspace]);

  /*
   * ============================
   * REAL-TIME PROJECT SOCKET
   * ============================
   */

  useEffect(() => {
    if (!user?.id || !id) return;

    const socket =
      connectProjectSocket(user.id);

    const joinRoom = () => {
      socket.emit(
        "join_project",
        id
      );
    };

    const handleTaskCreated = () => {
      loadWorkspace();
    };

    const handleTaskUpdated = () => {
      loadWorkspace();
    };

    const handleTaskDeleted = () => {
      loadWorkspace();
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once(
        "connect",
        joinRoom
      );
    }

    socket.on(
      "task_created",
      handleTaskCreated
    );

    socket.on(
      "task_updated",
      handleTaskUpdated
    );

    socket.on(
      "task_deleted",
      handleTaskDeleted
    );

    return () => {
      socket.emit(
        "leave_project",
        id
      );

      socket.off(
        "task_created",
        handleTaskCreated
      );

      socket.off(
        "task_updated",
        handleTaskUpdated
      );

      socket.off(
        "task_deleted",
        handleTaskDeleted
      );

      socket.off(
        "connect",
        joinRoom
      );
    };
  }, [id, user?.id, loadWorkspace]);

  /*
   * ============================
   * DELETE PROJECT
   * ============================
   */

  async function deleteProject() {
    const confirmed =
      window.confirm(
        "Delete this project permanently?\n\nAll project tasks, activities and related workspace data may be removed. This action cannot be undone."
      );

    if (!confirmed) return;

    try {
      setDeleting(true);

      await axios.delete(
        `${API}/projects/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/projects", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Failed to delete project:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete project."
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
   * ============================
   * FILTER / SEARCH / SORT
   * ============================
   */

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    const normalizedSearch =
      search.trim().toLowerCase();

    if (normalizedSearch) {
      list = list.filter(
        (task) => {
          const title =
            task.title?.toLowerCase() || "";

          const description =
            task.description?.toLowerCase() ||
            "";

          const labels = Array.isArray(
            task.labels
          )
            ? task.labels.join(" ").toLowerCase()
            : "";

          const assignee =
            task.assignedTo?.name
              ?.toLowerCase() || "";

          return (
            title.includes(
              normalizedSearch
            ) ||
            description.includes(
              normalizedSearch
            ) ||
            labels.includes(
              normalizedSearch
            ) ||
            assignee.includes(
              normalizedSearch
            )
          );
        }
      );
    }

    if (filter === "high") {
      list = list.filter(
        (task) =>
          task.priority === "high"
      );
    } else if (filter !== "all") {
      list = list.filter(
        (task) =>
          task.status === filter
      );
    }

    switch (sort) {
      case "oldest":
        list.sort(
          (a, b) =>
            new Date(a.createdAt) -
            new Date(b.createdAt)
        );
        break;

      case "priority": {
        const order = {
          high: 3,
          medium: 2,
          low: 1,
        };

        list.sort(
          (a, b) =>
            (order[b.priority] || 0) -
            (order[a.priority] || 0)
        );

        break;
      }

      case "deadline":
        list.sort(
          (a, b) => {
            const first =
              a.deadline
                ? new Date(
                    a.deadline
                  ).getTime()
                : Infinity;

            const second =
              b.deadline
                ? new Date(
                    b.deadline
                  ).getTime()
                : Infinity;

            return first - second;
          }
        );
        break;

      case "newest":
      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
        break;
    }

    return list;
  }, [
    tasks,
    search,
    filter,
    sort,
  ]);

  /*
   * ============================
   * TASK DRAWER
   * ============================
   */

  function openTask(task) {
    setSelectedTask(task);
    setDrawerOpen(true);
  }

  /*
   * ============================
   * LOADING STATE
   * ============================
   */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />

          <p className="mt-4 text-sm font-medium text-slate-300">
            Loading workspace
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Preparing your project environment...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================
   * ERROR STATE
   * ============================
   */

  if (error && !project) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            !
          </div>

          <h2 className="mt-5 text-xl font-semibold text-white">
            Unable to open workspace
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() =>
                loadWorkspace({
                  initial: true,
                })
              }
              className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Try again
            </button>

            <button
              onClick={() =>
                navigate("/projects")
              }
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Back to projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-[#111827] px-8 py-10 text-center">
          <h2 className="text-xl font-semibold text-white">
            Project not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The workspace may have been removed or
            you may no longer have access.
          </p>

          <button
            onClick={() =>
              navigate("/projects")
            }
            className="mt-6 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  /*
   * ============================
   * WORKSPACE
   * ============================
   */

  return (
    <>
      <div className="space-y-6">

        <WorkspaceHeader
          project={project}
          tasks={tasks}
          onCreateTask={() =>
            setOpenCreateModal(true)
          }
          onEditProject={() =>
            setEditProjectOpen(true)
          }
          onInvite={() =>
            setInviteOpen(true)
          }
          onRepository={() =>
            navigate(
              `/repository/${id}`
            )
          }
          onShare={async () => {
            try {
              if (
                navigator.share
              ) {
                await navigator.share({
                  title:
                    project.title ||
                    "DevConnect Project",
                  text:
                    project.description ||
                    "DevConnect project workspace",
                  url:
                    window.location.href,
                });

                return;
              }

              await navigator.clipboard.writeText(
                window.location.href
              );

              alert(
                "Workspace link copied."
              );
            } catch (err) {
              if (
                err?.name ===
                "AbortError"
              ) {
                return;
              }

              try {
                await navigator.clipboard.writeText(
                  window.location.href
                );

                alert(
                  "Workspace link copied."
                );
              } catch {
                alert(
                  "Unable to share this workspace right now."
                );
              }
            }
          }}
          onOpenAI={() =>
            navigate("/ai")
          }
          onDelete={
            project.creator?._id ===
            user?.id
              ? deleteProject
              : null
          }
          deleting={deleting}
        />

        <div className="relative">
          <WorkspaceToolbar
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            sort={sort}
            setSort={setSort}
          />

          {refreshing && (
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border border-white/10 border-t-cyan-400" />
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-sm text-yellow-300">
            {error}
          </div>
        )}

        <WorkspaceStats
          tasks={tasks}
          project={project}
        />

        <div className="grid grid-cols-12 gap-8">

          {/* LEFT SIDEBAR */}

          <div className="col-span-12 xl:col-span-2">
            <WorkspaceSidebar
              project={project}
            />
          </div>

          {/* CENTER */}

          <div className="col-span-12 xl:col-span-7">
            <KanbanBoard
              tasks={filteredTasks}
              reloadTasks={loadWorkspace}
              onTaskClick={openTask}
            />
          </div>

          {/* RIGHT SIDEBAR */}

          <div className="col-span-12 xl:col-span-3">
            <div className="space-y-6">

              <WorkspaceRightSidebar
                project={project}
                reloadWorkspace={
                  loadWorkspace
                }
              />

              <GitHubRepositoryCard
                projectId={id}
              />

              <ActivityFeed
                projectId={id}
              />

              <ProjectMembersCard
                project={project}
                reloadWorkspace={
                  loadWorkspace
                }
              />

            </div>
          </div>

        </div>

      </div>

      {/* CREATE TASK */}

      <CreateTaskModal
        open={openCreateModal}
        onClose={() =>
          setOpenCreateModal(false)
        }
        projectId={id}
        reloadTasks={loadWorkspace}
      />

      {/* INVITE MEMBER */}

      <InviteMemberModal
        open={inviteOpen}
        onClose={() =>
          setInviteOpen(false)
        }
        projectId={id}
        refreshTeam={loadWorkspace}
      />

      {/* EDIT PROJECT */}

      <EditProjectModal
        open={editProjectOpen}
        onClose={() =>
          setEditProjectOpen(false)
        }
        project={project}
        refreshProject={loadWorkspace}
      />

      {/* TASK DETAILS */}

      <TaskDetailsDrawer
        open={drawerOpen}
        task={selectedTask}
        reloadTasks={loadWorkspace}
        onClose={() =>
          setDrawerOpen(false)
        }
      />
    </>
  );
}

export default ProjectWorkspace;