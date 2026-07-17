import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import WorkspaceSidebar from "../components/workspace/WorkspaceSidebar";
import WorkspaceRightSidebar from "../components/workspace/WorkspaceRightSidebar";
import KanbanBoard from "../components/workspace/KanbanBoard";

const API = "http://localhost:5000/api";

function ProjectWorkspace() {
  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadWorkspace();
  }, []);

  async function loadWorkspace() {
    try {
      const [projectRes, taskRes] = await Promise.all([
        axios.get(`${API}/projects/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get(`${API}/tasks/project/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setProject(projectRes.data);
      setTasks(taskRes.data.tasks || []);
    } catch (err) {
      console.log(err);
    }
  }

  if (!project)
    return (
      <div className="text-center text-gray-400 mt-20">
        Loading Workspace...
      </div>
    );

  return (
    <div className="space-y-8">

      <WorkspaceHeader project={project} />

      <div className="grid grid-cols-12 gap-8">

        <div className="col-span-2">
          <WorkspaceSidebar />
        </div>

        <div className="col-span-7">
          <KanbanBoard tasks={tasks} />
        </div>

        <div className="col-span-3">
          <WorkspaceRightSidebar />
        </div>

      </div>

    </div>
  );
}

export default ProjectWorkspace;