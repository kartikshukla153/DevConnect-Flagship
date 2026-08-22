import { useEffect, useMemo, useState } from "react";
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

import { connectProjectSocket } from "../socket/projectSocket";

const API = "http://localhost:5000/api";

function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

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

  /*
  ============================================================
  LOAD TASKS ONLY
  ============================================================
  */

  async function loadTasks() {
    try {
      const response = await axios.get(
        `${API}/tasks/project/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const latestTasks = response.data?.tasks || [];

      console.log(
        "✅ TASKS REFRESHED:",
        latestTasks
      );

      setTasks(latestTasks);

      /*
      Keep the currently opened drawer synchronized
      with the latest backend task.
      */

      setSelectedTask((currentTask) => {
        if (!currentTask) {
          return null;
        }

        const updatedTask = latestTasks.find(
          (task) =>
            String(task._id) ===
            String(currentTask._id)
        );

        /*
        Task was deleted.
        */

        if (!updatedTask) {
          setDrawerOpen(false);
          return null;
        }

        /*
        Task still exists.
        Replace stale task object with
        the freshly fetched backend object.
        */

        return updatedTask;
      });

      return latestTasks;
    } catch (err) {
      console.error(
        "LOAD TASKS ERROR:",
        err
      );

      return [];
    }
  }

  /*
  ============================================================
  LOAD COMPLETE WORKSPACE
  ============================================================
  */

  async function loadWorkspace() {
    try {
      setLoading(true);

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

      console.log(
        "✅ PROJECT LOADED:",
        projectRes.data
      );

      console.log(
        "✅ TASKS LOADED:",
        taskRes.data
      );

      const latestTasks =
        taskRes.data?.tasks || [];

      setProject(projectRes.data);

      setTasks(latestTasks);

      /*
      If a task drawer was already open,
      synchronize it with the fresh backend task.
      */

      setSelectedTask((currentTask) => {
        if (!currentTask) {
          return null;
        }

        const updatedTask =
          latestTasks.find(
            (task) =>
              String(task._id) ===
              String(currentTask._id)
          );

        if (!updatedTask) {
          setDrawerOpen(false);
          return null;
        }

        return updatedTask;
      });
    } catch (err) {
      console.error(
        "LOAD WORKSPACE ERROR:",
        err
      );

      setProject(null);
    } finally {
      setLoading(false);
    }
  }

  /*
  ============================================================
  INITIAL WORKSPACE LOAD
  ============================================================
  */

  useEffect(() => {
    if (!id) return;

    loadWorkspace();
  }, [id]);

  /*
  ============================================================
  PROJECT SOCKET
  ============================================================
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

      console.log(
        "📁 Joined Project Room:",
        id
      );
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once(
        "connect",
        joinRoom
      );
    }

    /*
    Task created by another client/member
    */

    const handleTaskCreated = () => {
      console.log(
        "🟢 SOCKET: task_created"
      );

      loadTasks();
    };

    /*
    Task updated by another client/member
    */

    const handleTaskUpdated = () => {
      console.log(
        "🟡 SOCKET: task_updated"
      );

      loadTasks();
    };

    /*
    Task deleted by another client/member
    */

    const handleTaskDeleted = () => {
      console.log(
        "🔴 SOCKET: task_deleted"
      );

      loadTasks();
    };

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
  }, [id, user?.id]);

  /*
  ============================================================
  DELETE PROJECT
  ============================================================
  */

  async function deleteProject() {
    const confirmed =
      window.confirm(
        "Delete this project permanently?\n\nThis will delete every task, activity and cannot be undone."
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

      alert(
        "Project deleted successfully."
      );

      navigate("/projects");
    } catch (err) {
      console.error(
        "DELETE PROJECT ERROR:",
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
  ============================================================
  FILTER + SEARCH + SORT
  ============================================================
  */

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    /*
    SEARCH
    */

    if (search.trim()) {
      const query =
        search.toLowerCase();

      list = list.filter(
        (task) =>
          task.title
            ?.toLowerCase()
            .includes(query) ||
          task.description
            ?.toLowerCase()
            .includes(query)
      );
    }

    /*
    FILTER
    */

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

    /*
    SORT
    */

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
          (a, b) =>
            new Date(
              a.deadline || 0
            ) -
            new Date(
              b.deadline || 0
            )
        );
        break;

      default:
        list.sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
    }

    return list;
  }, [
    tasks,
    search,
    filter,
    sort,
  ]);

  /*
  ============================================================
  OPEN TASK
  ============================================================
  */

  function openTask(task) {
    setSelectedTask(task);
    setDrawerOpen(true);
  }

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-gray-400">
        Loading Workspace...
      </div>
    );
  }

  /*
  ============================================================
  PROJECT NOT FOUND
  ============================================================
  */

  if (!project) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-red-400">
        Project not found
      </div>
    );
  }

  /*
  ============================================================
  UI
  ============================================================
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
              await navigator.clipboard.writeText(
                window.location.href
              );

              alert(
                "✅ Workspace link copied."
              );
            } catch (err) {
              console.error(
                "SHARE ERROR:",
                err
              );
            }
          }}
          onOpenAI={() => {
            alert(
              "AI Workspace coming soon"
            );
          }}
          onDelete={
            project.creator?._id ===
            user?.id
              ? deleteProject
              : null
          }
          deleting={deleting}
        />

        <WorkspaceToolbar
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
        />

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
              reloadTasks={loadTasks}
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
        reloadTasks={loadTasks}
      />

      {/* INVITE */}

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
        refreshProject={
          loadWorkspace
        }
      />

      {/* TASK DETAILS */}

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