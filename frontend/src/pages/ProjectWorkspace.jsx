import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "../components/workspace/WorkspaceSidebar";
import WorkspaceRightSidebar from "../components/workspace/WorkspaceRightSidebar";
import KanbanBoard from "../components/workspace/KanbanBoard";
import CreateTaskModal from "../components/workspace/CreateTaskModal";
import TaskDetailsDrawer from "../components/workspace/TaskDetailsDrawer";
import {
  connectProjectSocket,
  disconnectProjectSocket,
} from "../socket/projectSocket";

const API = "http://localhost:5000/api";

function ProjectWorkspace() {
  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);
const s = connectProjectSocket(user._id);
  const [drawerOpen, setDrawerOpen] =
    useState(false);


    useEffect(() => {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  if (!user?._id) return;

  const s = connectProjectSocket(user._id);

  setSocket(s);

  s.emit("join_project", id);

  s.on("task_created", loadWorkspace);

  s.on("task_updated", loadWorkspace);

  s.on("task_deleted", loadWorkspace);

  return () => {
    s.emit("leave_project", id);

    s.off("task_created");

    s.off("task_updated");

    s.off("task_deleted");

    disconnectProjectSocket();
  };
}, [id]);
  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
    try {
      setLoading(true);

      const [projectRes, taskRes] =
        await Promise.all([
          axios.get(
            `${API}/projects/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

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
      <div className="space-y-8">

        <WorkspaceHeader
          project={project}
          onCreateTask={() =>
            setOpenCreateModal(true)
          }
        />

        <div className="grid grid-cols-12 gap-8">

          <div className="col-span-12 xl:col-span-2">

            <WorkspaceSidebar
              project={project}
            />

          </div>

          <div className="col-span-12 xl:col-span-7">

            <KanbanBoard
              tasks={tasks}
              reloadTasks={loadWorkspace}
              onTaskClick={openTask}
            />

          </div>

          <div className="col-span-12 xl:col-span-3">

            <WorkspaceRightSidebar
              project={project}
            />

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

      <TaskDetailsDrawer
  open={drawerOpen}
  task={selectedTask}
  reloadTasks={loadWorkspace}
  onClose={() => setDrawerOpen(false)}
/>
    </>
  );
}

export default ProjectWorkspace;