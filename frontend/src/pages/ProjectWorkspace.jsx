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

  useEffect(() => {
    loadWorkspace();
  }, [id]);

  useEffect(() => {
    if (!user?.id) return;

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

    socket.on(
      "task_created",
      () => {
        console.log(
          "🟢 task_created"
        );

        loadWorkspace();
      }
    );

    socket.on(
      "task_updated",
      () => {
        console.log(
          "🟡 task_updated"
        );

        loadWorkspace();
      }
    );

    socket.on(
      "task_deleted",
      () => {
        console.log(
          "🔴 task_deleted"
        );

        loadWorkspace();
      }
    );

    return () => {
      socket.emit(
        "leave_project",
        id
      );

      socket.off(
        "task_created"
      );

      socket.off(
        "task_updated"
      );

      socket.off(
        "task_deleted"
      );

      socket.off(
        "connect",
        joinRoom
      );
    };
  }, [id, user]);

  async function loadWorkspace() {
    try {
      setLoading(true);

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        projectRes,
        taskRes,
      ] = await Promise.all([
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
        "PROJECT SUCCESS",
        projectRes.data
      );

      console.log(
        "TASK SUCCESS",
        taskRes.data
      );

      setProject(
        projectRes.data
      );

      setTasks(
        taskRes.data.tasks || []
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }
    async function deleteProject() {
    const confirmed = window.confirm(
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

      alert("Project deleted successfully.");

      navigate("/projects");
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Unable to delete project."
      );
    } finally {
      setDeleting(false);
    }
  }

  const filteredTasks = useMemo(() => {
    let list = [...tasks];

    if (search.trim()) {
      list = list.filter(
        (task) =>
          task.title
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          task.description
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (filter === "high") {
      list = list.filter(
        (task) => task.priority === "high"
      );
    } else if (filter !== "all") {
      list = list.filter(
        (task) => task.status === filter
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
          (a, b) =>
            new Date(a.deadline || 0) -
            new Date(b.deadline || 0)
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

  function openTask(task) {
    setSelectedTask(task);
    setDrawerOpen(true);
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-gray-400">
        Loading Workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-red-400">
        Project not found
      </div>
    );
  }

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
            navigate(`/repository/${id}`)
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
              console.log(err);
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

          {/* CENTER CONTENT */}

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
                reloadWorkspace={loadWorkspace}
              />

              <GitHubRepositoryCard
                projectId={id}
              />

              <ActivityFeed
                projectId={id}
              />

              <ProjectMembersCard
                project={project}
                reloadWorkspace={loadWorkspace}
              />

            </div>

          </div>

        </div>

      </div>
            <CreateTaskModal
        open={openCreateModal}
        onClose={() =>
          setOpenCreateModal(false)
        }
        projectId={id}
        reloadTasks={loadWorkspace}
      />

      <InviteMemberModal
        open={inviteOpen}
        onClose={() =>
          setInviteOpen(false)
        }
        projectId={id}
        refreshTeam={loadWorkspace}
      />

      <EditProjectModal
        open={editProjectOpen}
        onClose={() =>
          setEditProjectOpen(false)
        }
        project={project}
        refreshProject={loadWorkspace}
      />

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