import { useEffect, useState } from "react";

import {
  getProjects,
  joinProject,
} from "../services/projectService";

import ProjectCard from "../components/projects/ProjectCard";

function Projects() {
  const [projects, setProjects] = useState([]);

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleJoin = async (id) => {
    try {
      await joinProject(id);
      alert("Join request sent.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to send request."
      );
    }
  };

  return (
    <div className="space-y-8">

      <div>

        <h1 className="text-4xl font-bold text-white">
          Explore Projects
        </h1>

        <p className="mt-2 text-gray-400">
          Find open-source, startup and collaboration projects.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        {projects.map((project) => (
          <ProjectCard
            key={project._id}
            project={project}
            onJoin={handleJoin}
          />
        ))}

      </div>

    </div>
  );
}

export default Projects;