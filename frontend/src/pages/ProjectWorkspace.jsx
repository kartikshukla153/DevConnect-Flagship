import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
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
import ActivityFeed from "../components/workspace/ActivityFeed";
import GitHubRepositoryCard from "../components/workspace/GitHubRepositoryCard";
import { connectProjectSocket } from "../socket/projectSocket";

function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareState, setShareState] = useState("");
  const [activityVersion, setActivityVersion] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  /*
   * -------------------------------------------------------
   * REQUEST / SYNCHRONIZATION REFS
   * -------------------------------------------------------
   *
   * requestIdRef prevents an older workspace request from
   * overwriting data returned by a newer request.
   *
   * tasksRef gives mutation handlers access to the latest
   * task state without depending on a stale render snapshot.
   *
   * statusMutationRef tracks the latest status mutation for
   * each task so an older API response cannot overwrite a
   * newer user action.
   *
   * taskEventVersionRef helps prevent a failed optimistic
   * mutation from rolling back over a newer realtime event.
   *
   * shareTimerRef keeps the temporary share message lifecycle
   * controlled.
   */
  const requestIdRef = useRef(0);
  const tasksRef = useRef([]);
  const statusMutationRef = useRef(new Map());
  const taskEventVersionRef = useRef(new Map());
  const shareTimerRef = useRef(null);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  /*
   * -------------------------------------------------------
   * SELECTED TASK SYNCHRONIZATION
   * -------------------------------------------------------
   */
  const syncSelectedTask = useCallback((latestTasks) => {
    setSelectedTask((current) => {
      if (!current) return null;

      const updated = latestTasks.find(
        (task) => String(task._id) === String(current._id)
      );

      if (!updated) {
        setDrawerOpen(false);
        return null;
      }

      return updated;
    });
  }, []);

  /*
   * -------------------------------------------------------
   * TASK LOADING
   * -------------------------------------------------------
   */
  const loadTasks = useCallback(async () => {
    if (!id) return [];

    try {
      const response = await api.get(`/tasks/project/${id}`);

      const latestTasks = Array.isArray(response.data?.tasks)
        ? response.data.tasks
        : [];

      setTasks(latestTasks);
      tasksRef.current = latestTasks;

      syncSelectedTask(latestTasks);
      setLastSyncedAt(new Date());

      return latestTasks;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Tasks could not be loaded. Please try again.";

      setError(message);

      throw err;
    }
  }, [id, syncSelectedTask]);

  /*
   * -------------------------------------------------------
   * FULL WORKSPACE LOAD
   * -------------------------------------------------------
   */
  const loadWorkspace = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) return;

      const requestId = ++requestIdRef.current;

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const [projectRes, taskRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks/project/${id}`),
        ]);

        /*
         * If another request started while this one was
         * running, discard this response.
         */
        if (requestId !== requestIdRef.current) return;

        const latestTasks = Array.isArray(taskRes.data?.tasks)
          ? taskRes.data.tasks
          : [];

        const latestProject = projectRes.data?.project || null;

        setProject(latestProject);
        setTasks(latestTasks);

        tasksRef.current = latestTasks;

        syncSelectedTask(latestTasks);
        setLastSyncedAt(new Date());
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        const status = err.response?.status;

        if (status === 401) {
          setError("Your session has expired. Please sign in again.");
        } else if (status === 403) {
          setError("You do not have access to this workspace.");
        } else if (status === 404) {
          setError("This project could not be found.");
        } else {
          setError(
            err.response?.data?.message ||
              "Workspace could not be loaded. Check the API and try again."
          );
        }

        setProject(null);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [id, syncSelectedTask]
  );

  /*
   * -------------------------------------------------------
   * INITIAL WORKSPACE LOAD
   * -------------------------------------------------------
   */
  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  /*
   * -------------------------------------------------------
   * SHARE MESSAGE CLEANUP
   * -------------------------------------------------------
   */
  useEffect(() => {
    return () => {
      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
      }
    };
  }, []);

  /*
   * -------------------------------------------------------
   * REALTIME PROJECT SOCKET
   * -------------------------------------------------------
   */
  useEffect(() => {
    if (!user?.id || !id) return;

    const socket = connectProjectSocket(user.id);

    if (!socket) return;

    const joinRoom = () => {
      socket.emit("join_project", id);
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    /*
     * ---------------------------------------------------
     * REALTIME TASK UPSERT
     * ---------------------------------------------------
     */
    const upsertTask = (incomingTask) => {
      if (!incomingTask?._id) return;

      /*
       * If the backend includes a project identifier,
       * ensure the event belongs to this workspace.
       *
       * If the backend doesn't include project yet,
       * we preserve compatibility and accept the event.
       */
      if (
        incomingTask.project &&
        String(incomingTask.project) !== String(id)
      ) {
        return;
      }

      const taskId = String(incomingTask._id);

      taskEventVersionRef.current.set(
        taskId,
        (taskEventVersionRef.current.get(taskId) || 0) + 1
      );

      setTasks((current) => {
        const index = current.findIndex(
          (task) => String(task._id) === taskId
        );

        if (index === -1) {
          const next = [incomingTask, ...current];
          tasksRef.current = next;
          return next;
        }

        const next = [...current];

        next[index] = {
          ...next[index],
          ...incomingTask,
        };

        tasksRef.current = next;

        return next;
      });

      setSelectedTask((current) => {
        if (!current || String(current._id) !== taskId) {
          return current;
        }

        return {
          ...current,
          ...incomingTask,
        };
      });

      setLastSyncedAt(new Date());
    };

    /*
     * ---------------------------------------------------
     * REALTIME TASK DELETE
     * ---------------------------------------------------
     */
    const removeTask = ({ taskId, projectId } = {}) => {
      if (!taskId) return;

      if (
        projectId &&
        String(projectId) !== String(id)
      ) {
        return;
      }

      const normalizedTaskId = String(taskId);

      taskEventVersionRef.current.set(
        normalizedTaskId,
        (taskEventVersionRef.current.get(normalizedTaskId) || 0) + 1
      );

      setTasks((current) => {
        const next = current.filter(
          (task) => String(task._id) !== normalizedTaskId
        );

        tasksRef.current = next;

        return next;
      });

      setSelectedTask((current) => {
        if (
          !current ||
          String(current._id) !== normalizedTaskId
        ) {
          return current;
        }

        setDrawerOpen(false);
        return null;
      });

      setLastSyncedAt(new Date());
    };

    /*
     * ---------------------------------------------------
     * ACTIVITY EVENTS
     * ---------------------------------------------------
     */
    const handleActivity = () => {
      setActivityVersion((value) => value + 1);
    };

    /*
     * ---------------------------------------------------
     * TEAM EVENTS
     * ---------------------------------------------------
     */
    const handleTeamUpdate = () => {
      loadWorkspace({ silent: true });
    };

    const handleProjectMemberJoined = (payload = {}) => {
      if (!payload?.projectId) return;

      if (String(payload.projectId) !== String(id)) {
        return;
      }

      loadWorkspace({ silent: true });

      setActivityVersion((value) => value + 1);
    };

    /*
     * ---------------------------------------------------
     * SOCKET SUBSCRIPTIONS
     * ---------------------------------------------------
     */
    socket.on("task_created", upsertTask);
    socket.on("task_updated", upsertTask);
    socket.on("task_deleted", removeTask);
    socket.on("activity_added", handleActivity);
    socket.on("team_updated", handleTeamUpdate);
    socket.on(
      "project_member_joined",
      handleProjectMemberJoined
    );

    /*
     * ---------------------------------------------------
     * CLEANUP
     * ---------------------------------------------------
     */
    return () => {
      socket.off("task_created", upsertTask);
      socket.off("task_updated", upsertTask);
      socket.off("task_deleted", removeTask);
      socket.off("activity_added", handleActivity);
      socket.off("team_updated", handleTeamUpdate);
      socket.off(
        "project_member_joined",
        handleProjectMemberJoined
      );

      socket.off("connect", joinRoom);

      socket.emit("leave_project", id);

      taskEventVersionRef.current.clear();
    };
  }, [id, user?.id, loadWorkspace]);

  /*
   * -------------------------------------------------------
   * TASK STATUS CHANGE
   * -------------------------------------------------------
   *
   * Optimistic update:
   *
   * UI changes immediately
   *       ↓
   * API request
   *       ↓
   * server confirms
   *       OR
   * request fails → safe rollback
   *
   * Each task gets its own mutation sequence so an older
   * response cannot overwrite a newer user action.
   */
  const handleTaskStatusChange = useCallback(
    async (taskId, status) => {
      const normalizedTaskId = String(taskId);

      const previous = tasksRef.current.find(
        (task) => String(task._id) === normalizedTaskId
      );

      if (!previous || previous.status === status) {
        return;
      }

      const mutationId =
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const eventVersionAtStart =
        taskEventVersionRef.current.get(normalizedTaskId) || 0;

      statusMutationRef.current.set(
        normalizedTaskId,
        mutationId
      );

      /*
       * Optimistic task update.
       */
      setTasks((current) => {
        const next = current.map((task) =>
          String(task._id) === normalizedTaskId
            ? {
                ...task,
                status,
              }
            : task
        );

        tasksRef.current = next;

        return next;
      });

      setSelectedTask((current) =>
        current &&
        String(current._id) === normalizedTaskId
          ? {
              ...current,
              status,
            }
          : current
      );

      try {
        const response = await api.put(
          `/tasks/status/${normalizedTaskId}`,
          {
            status,
          }
        );

        /*
         * Ignore an old API response if another mutation for
         * this same task has already started.
         */
        if (
          statusMutationRef.current.get(normalizedTaskId) !==
          mutationId
        ) {
          return;
        }

        const updated = response.data?.task;

        if (updated) {
          setTasks((current) => {
            const next = current.map((task) =>
              String(task._id) === normalizedTaskId
                ? {
                    ...task,
                    ...updated,
                  }
                : task
            );

            tasksRef.current = next;

            return next;
          });

          setSelectedTask((current) =>
            current &&
            String(current._id) === normalizedTaskId
              ? {
                  ...current,
                  ...updated,
                }
              : current
          );
        }

        setLastSyncedAt(new Date());
      } catch (err) {
        /*
         * Only the latest mutation is allowed to rollback.
         */
        if (
          statusMutationRef.current.get(normalizedTaskId) !==
          mutationId
        ) {
          throw err;
        }

        /*
         * If a newer realtime event arrived while our request
         * was in flight, don't overwrite that newer server state
         * with the old snapshot.
         */
        const currentEventVersion =
          taskEventVersionRef.current.get(normalizedTaskId) || 0;

        if (currentEventVersion === eventVersionAtStart) {
          setTasks((current) => {
            const next = current.map((task) =>
              String(task._id) === normalizedTaskId
                ? previous
                : task
            );

            tasksRef.current = next;

            return next;
          });

          setSelectedTask((current) =>
            current &&
            String(current._id) === normalizedTaskId
              ? previous
              : current
          );
        }

        setError(
          err.response?.data?.message ||
            "Unable to update task status."
        );

        throw err;
      } finally {
        if (
          statusMutationRef.current.get(normalizedTaskId) ===
          mutationId
        ) {
          statusMutationRef.current.delete(
            normalizedTaskId
          );
        }
      }
    },
    []
  );

  /*
   * -------------------------------------------------------
   * DELETE PROJECT
   * -------------------------------------------------------
   */
  const deleteProject = async () => {
    if (
      !window.confirm(
        "Delete this project permanently? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(`/projects/${id}`);

      /*
       * Invalidate any workspace request that may still be
       * resolving before navigation.
       */
      requestIdRef.current += 1;

      navigate("/projects", {
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this project."
      );
    } finally {
      setDeleting(false);
    }
  };

  /*
   * -------------------------------------------------------
   * SHARE WORKSPACE
   * -------------------------------------------------------
   */
  const handleShare = async () => {
    if (shareTimerRef.current) {
      window.clearTimeout(shareTimerRef.current);
    }

    try {
      if (
        !navigator.clipboard ||
        typeof navigator.clipboard.writeText !== "function"
      ) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(
        window.location.href
      );

      setShareState("Workspace link copied");

      shareTimerRef.current = window.setTimeout(() => {
        setShareState("");
        shareTimerRef.current = null;
      }, 2500);
    } catch {
      setShareState(
        "Copy failed — use the browser address bar."
      );

      shareTimerRef.current = window.setTimeout(() => {
        setShareState("");
        shareTimerRef.current = null;
      }, 3000);
    }
  };

  /*
   * -------------------------------------------------------
   * AI WORKSPACE
   * -------------------------------------------------------
   */
  const handleOpenAI = () => {
    localStorage.setItem("aiProjectId", id);
    navigate("/ai");
  };

  /*
   * -------------------------------------------------------
   * TASK SEARCH / FILTER / SORT
   * -------------------------------------------------------
   */
  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    const query = search.trim().toLowerCase();

    if (query) {
      list = list.filter((task) => {
        const haystack = [
          task.title,
          task.description,
          task.assignedTo?.name,
          ...(Array.isArray(task.labels)
            ? task.labels
            : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      });
    }

    if (filter === "high") {
      list = list.filter((task) =>
        ["high", "urgent"].includes(task.priority)
      );
    } else if (filter !== "all") {
      list = list.filter(
        (task) => task.status === filter
      );
    }

    const priorityRank = {
      urgent: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    list.sort((a, b) => {
      if (sort === "oldest") {
        return (
          new Date(a.createdAt || 0) -
          new Date(b.createdAt || 0)
        );
      }

      if (sort === "priority") {
        return (
          (priorityRank[b.priority] || 0) -
          (priorityRank[a.priority] || 0)
        );
      }

      if (sort === "deadline") {
        const aTime = a.deadline
          ? new Date(a.deadline).getTime()
          : Number.MAX_SAFE_INTEGER;

        const bTime = b.deadline
          ? new Date(b.deadline).getTime()
          : Number.MAX_SAFE_INTEGER;

        return aTime - bTime;
      }

      return (
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
      );
    });

    return list;
  }, [tasks, search, filter, sort]);

  /*
   * -------------------------------------------------------
   * TASK DRAWER
   * -------------------------------------------------------
   */
  const openTask = (task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  /*
   * -------------------------------------------------------
   * LOADING STATE
   * -------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-[#111827] p-12 text-center text-slate-400">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-400" />

        Loading workspace…
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * PROJECT UNAVAILABLE
   * -------------------------------------------------------
   */
  if (!project) {
    return (
      <div className="rounded-3xl border border-red-500/20 bg-[#111827] p-10 text-center">
        <h2 className="text-xl font-semibold text-white">
          Workspace unavailable
        </h2>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
          {error ||
            "The project could not be loaded."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => loadWorkspace()}
            className="rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black hover:bg-cyan-300"
          >
            Try again
          </button>

          <button
            onClick={() => navigate("/projects")}
            className="rounded-xl border border-white/10 px-5 py-3 text-white hover:bg-white/5"
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  /*
   * -------------------------------------------------------
   * WORKSPACE
   * -------------------------------------------------------
   */
  return (
    <>
      <div className="space-y-6">
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-200">
            <span>{error}</span>

            <button
              onClick={() => {
                setError("");
                loadWorkspace({
                  silent: true,
                });
              }}
              className="font-semibold text-amber-300 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

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
              `/projects/${id}/repository`
            )
          }
          onShare={handleShare}
          onOpenAI={handleOpenAI}
          onDelete={
            project.creator?._id === user?.id
              ? deleteProject
              : null
          }
          deleting={deleting}
          onRefresh={() =>
            loadWorkspace({
              silent: true,
            })
          }
          refreshing={refreshing}
        />

        {shareState && (
          <div className="fixed bottom-6 right-6 z-[250] rounded-2xl border border-cyan-500/20 bg-[#111827] px-5 py-3 text-sm font-medium text-cyan-200 shadow-2xl">
            {shareState}
          </div>
        )}

        <WorkspaceToolbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          totalTasks={tasks.length}
          visibleTasks={filteredTasks.length}
          refreshing={refreshing}
          onRefresh={() =>
            loadWorkspace({
              silent: true,
            })
          }
        />

        <WorkspaceStats
          tasks={tasks}
          project={project}
        />

        <div className="grid grid-cols-12 gap-6 xl:gap-8">
          <div className="col-span-12 xl:col-span-2">
            <WorkspaceSidebar
              project={project}
              taskCount={tasks.length}
              activeSection="tasks"
              onCreateTask={() =>
                setOpenCreateModal(true)
              }
              onInvite={() =>
                setInviteOpen(true)
              }
              onOpenAI={handleOpenAI}
            />
          </div>

          <main className="col-span-12 min-w-0 xl:col-span-7">
            <KanbanBoard
              tasks={filteredTasks}
              onTaskClick={openTask}
              onTaskStatusChange={
                handleTaskStatusChange
              }
              onAddTask={() =>
                setOpenCreateModal(true)
              }
            />
          </main>

          <aside className="col-span-12 xl:col-span-3">
            <div className="space-y-6">
              <WorkspaceRightSidebar
                project={project}
                tasks={tasks}
                onCreateTask={() =>
                  setOpenCreateModal(true)
                }
                onInvite={() =>
                  setInviteOpen(true)
                }
                onRepository={() =>
                  navigate(
                    `/projects/${id}/repository`
                  )
                }
                onOpenAI={handleOpenAI}
              />

              <GitHubRepositoryCard
                projectId={id}
              />

              <ActivityFeed
                projectId={id}
                refreshKey={activityVersion}
              />
            </div>
          </aside>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827] px-5 py-3 text-xs text-slate-500">
          <span>
            {filteredTasks.length} visible of{" "}
            {tasks.length} tasks
          </span>

          <span>
            {lastSyncedAt
              ? `Synced ${lastSyncedAt.toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}`
              : "Syncing…"}
          </span>
        </div>
      </div>

      <CreateTaskModal
        open={openCreateModal}
        onClose={() =>
          setOpenCreateModal(false)
        }
        projectId={id}
        reloadTasks={loadTasks}
      />

      <InviteMemberModal
        open={inviteOpen}
        onClose={() =>
          setInviteOpen(false)
        }
        projectId={id}
        refreshTeam={() =>
          loadWorkspace({
            silent: true,
          })
        }
      />

      <EditProjectModal
        open={editProjectOpen}
        onClose={() =>
          setEditProjectOpen(false)
        }
        project={project}
        refreshProject={() =>
          loadWorkspace({
            silent: true,
          })
        }
      />

      <TaskDetailsDrawer
        open={drawerOpen}
        task={selectedTask}
        reloadTasks={loadTasks}
        onClose={() =>
          setDrawerOpen(false)
        }
      />
    </>
  );
}

export default ProjectWorkspace;