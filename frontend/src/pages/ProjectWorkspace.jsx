import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import useAuth from "../hooks/useAuth";

import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import WorkspaceToolbar from "../components/workspace/WorkspaceToolbar";
import WorkspaceSidebar from "../components/workspace/WorkspaceSidebar";
import WorkspaceRightSidebar from "../components/workspace/WorkspaceRightSidebar";
import KanbanBoard from "../components/workspace/KanbanBoard";
import CreateTaskModal from "../components/workspace/CreateTaskModal";
import TaskDetailsDrawer from "../components/workspace/TaskDetailsDrawer";
import WorkspaceStats from "../components/workspace/WorkspaceStats";
import {
  connectProjectSocket,
  disconnectProjectSocket,
} from "../socket/projectSocket";
import InviteMemberModal from "../components/workspace/InviteMemberModal";
import ProjectMembersCard from "../components/workspace/ProjectMembersCard";

const API = "http://localhost:5000/api";

function ProjectWorkspace() {
  const { id } = useParams();

  const token = localStorage.getItem("token");
const { user } = useAuth();
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

    const [inviteOpen, setInviteOpen] = useState(false);

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  useEffect(() => {
    loadWorkspace();
  }, [id]);

  useEffect(() => {
if (!user?.id) return;

const userId = user.id;

const socket = connectProjectSocket(userId);

if (socket.connected) {
 
} else {
  socket.on("connect", () => {
    console.log("EMITTING JOIN");
console.log(socket.id);
console.log(socket.connected);
console.log(socket.listeners("connect"));
    socket.emit("join_project", id);
    console.log("JOINED PROJECT AFTER CONNECT:", id);
  });
}
    socket.emit("join_project", id);
    console.log("Joined room:", id);

   socket.on("task_created", (task) => {
  console.log("🔥 TASK CREATED RECEIVED", task);

  loadWorkspace();
});
    socket.on("task_updated", (task) => {
  console.log("🔥 TASK UPDATED RECEIVED", task);

  loadWorkspace();
});
    socket.on("task_deleted", (task) => {
  console.log("🔥 TASK DELETED RECEIVED", task);

  loadWorkspace();
});

  return () => {
  socket.emit("leave_project", id);

  socket.off("task_created");
  socket.off("task_updated");
  socket.off("task_deleted");

  // DO NOT disconnect the global socket.
};
  }, [id]);

  async function loadWorkspace() {
    try {
      setLoading(true);

      const [projectRes, taskRes] =
        await Promise.all([
          axios.get(`${API}/projects/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          axios.get(
            `${API}/tasks/project/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      setProject(projectRes.data);
      setTasks(taskRes.data.tasks || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
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
  }, [tasks, search, filter, sort]);

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
  onCreateTask={() => setOpenCreateModal(true)}
  onInvite={() => setInviteOpen(true)}

  onRepository={() => {
  window.open(`/repository/${id}`, "_blank");
}}
  onRepository={() => {
    if (project?.githubRepo) {
      window.open(project.githubRepo, "_blank");
    } else {
      alert("No GitHub repository linked.");
    }
  }}
  onShare={async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("✅ Workspace link copied.");
    } catch (err) {
      console.log(err);
    }
  }}
  onOpenAI={() => {
    alert("AI Workspace coming soon");
  }}

  onInvite={() => setInviteOpen(true)}

 onShare={async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);

    alert("✅ Workspace link copied to clipboard.");
  } catch (err) {
    console.log(err);
    alert("Unable to copy workspace link.");
  }
}}
  onOpenAI={() => {
    alert("AI Workspace coming soon");
  }}
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

          <div className="col-span-12 xl:col-span-2">
            <WorkspaceSidebar
              project={project}
            />
          </div>

          <div className="col-span-12 xl:col-span-7">
            <KanbanBoard
              tasks={filteredTasks}
              reloadTasks={loadWorkspace}
              onTaskClick={openTask}
            />
          </div>

          <div className="col-span-12 xl:col-span-3">
       <div className="space-y-6">

  <WorkspaceRightSidebar
    project={project}
    reloadWorkspace={loadWorkspace}
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
  onClose={() => setInviteOpen(false)}
  projectId={id}
  refreshTeam={loadWorkspace}
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