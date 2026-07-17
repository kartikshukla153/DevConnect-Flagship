import {
  Users,
  Code2,
  Clock3,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

function ProjectCard({ project, onJoin }) {
  return (
    <div className="group rounded-3xl border border-white/10 bg-[#111827] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-2xl font-bold text-white">
            {project.title}
          </h2>

          <p className="mt-3 line-clamp-3 text-gray-400">
            {project.description}
          </p>

        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            project.status === "open"
              ? "bg-green-500/20 text-green-400"
              : project.status === "in-progress"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {project.status}
        </span>

      </div>

      <div className="mt-6 flex flex-wrap gap-2">

        {(project.techStack || []).map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300"
          >
            {tech}
          </span>
        ))}

      </div>

      <div className="mt-8 flex items-center gap-6 text-gray-400">

        <div className="flex items-center gap-2">
          <Users size={18} />
          {project.members?.length || 0}
        </div>

        <div className="flex items-center gap-2">
          <Code2 size={18} />
          {project.rolesNeeded?.length || 0} Roles
        </div>

        <div className="flex items-center gap-2">
          <Clock3 size={18} />
          {project.estimatedWeeks || "-"} Weeks
        </div>

      </div>

      <div className="mt-8 flex gap-4">

        <Link
          to={`/projects/${project._id}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0B1220] py-3 font-semibold transition hover:border-cyan-400"
        >
          View
          <ArrowRight size={18} />
        </Link>

        <button
          onClick={() => onJoin(project._id)}
          className="flex-1 rounded-xl bg-cyan-400 py-3 font-semibold text-black transition hover:bg-cyan-300"
        >
          Join Project
        </button>

      </div>

    </div>
  );
}

export default ProjectCard;