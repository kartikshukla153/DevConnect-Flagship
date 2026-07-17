import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getProject,
  dashboard,
  activity,
} from "../services/projectService";

import {
  Globe,
  Users,
  Calendar,
  Code2,
  ArrowLeft,
} from "lucide-react";

function ProjectDetails() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const p = await getProject(id);

      setProject(p);

      try {
        const d = await dashboard(id);
        setStats(d);
      } catch {}

      try {
        const a = await activity(id);
        setActivities(a.activities || []);
      } catch {}
    } catch (err) {
      console.log(err);
    }
  };

  if (!project)
    return (
      <div className="py-24 text-center text-gray-400">
        Loading...
      </div>
    );

  return (
    <div className="space-y-8">

      <div className="rounded-3xl border border-white/10 bg-[#111827] p-10">

        <div className="flex items-start justify-between">

          <div>

            <h1 className="text-4xl font-bold">
              {project.title}
            </h1>

            <p className="mt-5 max-w-4xl leading-8 text-gray-400">
              {project.description}
            </p>

          </div>

          <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-cyan-300">
            {project.status}
          </span>

        </div>

        <div className="mt-8 flex flex-wrap gap-3">

          {(project.techStack || []).map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2"
            >
              {tech}
            </span>
          ))}

        </div>

        <div className="mt-8 flex gap-4">

          {project.githubRepo && (
            <a
              href={project.githubRepo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B1220] px-5 py-3"
            >
              <Code2 size={18} />
              GitHub
            </a>
          )}

          {project.liveLink && (
            <a
              href={project.liveLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black"
            >
              <Globe size={18} />
              Live Demo
            </a>
          )}

        </div>

      </div>

      {stats && (
        <div className="grid gap-6 md:grid-cols-5">

          <Card title="Members" value={stats.totalMembers} />

          <Card title="Tasks" value={stats.totalTasks} />

          <Card title="Completed" value={stats.completedTasks} />

          <Card title="In Progress" value={stats.inProgressTasks} />

          <Card title="Completion" value={`${stats.completionRate}%`} />

        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-3">

        <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-[#111827] p-8">

          <h2 className="mb-8 text-2xl font-bold">
            Activity Timeline
          </h2>

          <div className="space-y-5">

            {activities.length === 0 ? (
              <p className="text-gray-500">
                No activity yet.
              </p>
            ) : (
              activities.map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-white/10 bg-[#0B1220] p-5"
                >
                  <div className="font-semibold">
                    {item.message}
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {new Date(
                      item.createdAt
                    ).toLocaleString()}
                  </div>
                </div>
              ))
            )}

          </div>

        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">

          <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold">

            <Users />

            Team Members

          </h2>

          <div className="space-y-5">

            {(project.members || []).map((m) => (
              <div
                key={m.user?._id}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1220] p-4"
              >
                <div>

                  <div className="font-semibold">
                    {m.user?.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {m.role}
                  </div>

                </div>

                <CheckCircle2
                  className="text-cyan-400"
                  size={20}
                />

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">

      <div className="text-sm text-gray-400">
        {title}
      </div>

      <div className="mt-3 text-3xl font-bold">
        {value}
      </div>

    </div>
  );
}

export default ProjectDetails;