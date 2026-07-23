import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Users,
  Code2,
  ArrowRight,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

const API = "http://localhost:5000/api/projects";

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useMemo(() => {
    let data = [...projects];

    if (status !== "all") {
      data = data.filter(
        (p) => p.status === status
      );
    }

    if (search.trim()) {
      data = data.filter(
        (p) =>
          p.title
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          p.description
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    setFiltered(data);
  }, [projects, search, status]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold">
            Projects
          </h1>

          <p className="mt-2 text-gray-400">
            Discover and collaborate with developers.
          </p>
        </div>

        <button
          onClick={() =>
            navigate("/projects/create")
          }
          className="flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300"
        >
          <Plus size={20} />
          Create Project
        </button>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search projects..."
            className="w-full rounded-xl border border-white/10 bg-[#111827] py-3 pl-11 pr-4 outline-none focus:border-cyan-400"
          />
        </div>

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="rounded-xl border border-white/10 bg-[#111827] px-5"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="in-progress">
            In Progress
          </option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400">
          Loading Projects...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-20 text-center">
          <h2 className="text-2xl font-bold">
            No Projects Found
          </h2>

          <p className="mt-3 text-gray-400">
            Create the first project.
          </p>
        </div>
      ) : (
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project) => (
            <div
              key={project._id}
              className="group rounded-3xl border border-white/10 bg-[#111827] p-7 transition hover:-translate-y-1 hover:border-cyan-400"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold">
                  {project.title}
                </h2>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    project.status === "open"
                      ? "bg-green-500/20 text-green-400"
                      : project.status ===
                        "closed"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <p className="mt-5 line-clamp-3 text-gray-400">
                {project.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {project.techStack?.map(
                  (tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs text-cyan-300"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-5 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    {project.members?.length ||
                      0}
                  </div>

                  <div className="flex items-center gap-2">
                    <Code2 size={16} />
                    {project.rolesNeeded
                      ?.length || 0}
                  </div>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                >
                  View
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;