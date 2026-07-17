import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Globe,
  Code2,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const API = "http://localhost:5000/api/projects";

function ProjectDetails() {
  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      const res = await axios.get(`${API}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProject(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const requestJoin = async () => {
    try {
      await axios.put(
        `${API}/join-request/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Join request sent.");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-xl text-gray-400">
        Loading Project...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        Project not found.
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-cyan-400"
      >
        <ArrowLeft size={18} />
        Back
      </Link>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-600 to-indigo-600 p-10">

        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">

          <div>

            <h1 className="text-5xl font-bold">
              {project.title}
            </h1>

            <p className="mt-5 max-w-3xl text-lg text-white/90">
              {project.description}
            </p>

          </div>

          <button
            onClick={requestJoin}
            className="flex h-fit items-center gap-3 rounded-xl bg-white px-6 py-3 font-semibold text-black"
          >
            <UserPlus size={18} />
            Join Project
          </button>

        </div>

      </div>

      <div className="grid gap-8 lg:grid-cols-3">

        <div className="space-y-8 lg:col-span-2">

          <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">

            <h2 className="mb-5 text-2xl font-bold">
              Overview
            </h2>

            <p className="leading-8 text-gray-300">
              {project.overview || project.description}
            </p>

          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">

            <h2 className="mb-6 text-2xl font-bold">
              Tech Stack
            </h2>

            <div className="flex flex-wrap gap-3">

              {project.techStack?.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-cyan-500/10 px-4 py-2 text-cyan-300"
                >
                  {tech}
                </span>
              ))}

            </div>

          </div>

          <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">

            <h2 className="mb-6 text-2xl font-bold">
              Team Members
            </h2>

            <div className="space-y-4">

              {project.members?.map((member) => (

                <div
                  key={member.user?._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 p-5"
                >

                  <div>

                    <h3 className="font-semibold">
                      {member.user?.name}
                    </h3>

                    <p className="text-sm text-gray-400">
                      {member.role}
                    </p>

                  </div>

                  <Users className="text-cyan-400" />

                </div>

              ))}

            </div>

          </div>

        </div>

        <div className="space-y-8">

          <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">

            <h2 className="mb-6 text-xl font-bold">
              Project Stats
            </h2>

            <div className="space-y-5">

              <div className="flex justify-between">

                <span>Members</span>

                <span>{project.members?.length || 0}</span>

              </div>

              <div className="flex justify-between">

                <span>Roles</span>

                <span>{project.rolesNeeded?.length || 0}</span>

              </div>

              <div className="flex justify-between">

                <span>Status</span>

                <span>{project.status}</span>

              </div>

              <div className="flex justify-between">

                <span>Difficulty</span>

                <span>{project.difficulty || "-"}</span>

              </div>

              <div className="flex justify-between">

                <span>Duration</span>

                <span>{project.estimatedWeeks || 0} Weeks</span>

              </div>

            </div>

          </div>

          {project.githubRepo && (
            <a
              href={project.githubRepo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] p-6 hover:border-cyan-400"
            >
              <Code2 />
              GitHub Repository
            </a>
          )}

          {project.liveLink && (
            <a
              href={project.liveLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827] p-6 hover:border-cyan-400"
            >
              <Globe />
              Live Project
            </a>
          )}

          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">

            <Code2 className="mb-4 text-cyan-400" />

            <h2 className="text-xl font-bold">
              AI Workspace
            </h2>

            <p className="mt-3 text-gray-300">
              AI code reviews, architecture suggestions, documentation,
              debugging and summaries will be integrated directly into this
              project workspace.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ProjectDetails;