import { useEffect, useState } from "react";
import {
  Globe,
  Star,
  GitFork,
  Eye,
  AlertCircle,
  ExternalLink,
  Code2,
  GitBranch,
} from "lucide-react";

import { fetchRepository } from "../../api/github";

function GitHubRepositoryCard({ projectId }) {
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepository();
  }, [projectId]);

  async function loadRepository() {
    try {
      const data = await fetchRepository(projectId);
      setRepo(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">
        <p className="text-sm text-gray-400">
          Loading GitHub repository...
        </p>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">
        <div className="flex items-center gap-3">
           <Globe className="text-cyan-400" />

          <div>
            <h3 className="font-semibold text-white">
              GitHub Repository
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              No repository connected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

      <div className="mb-6 flex items-center gap-3">

        <GitHub className="text-cyan-400" />

        <div>

          <h2 className="font-semibold text-white">
            GitHub Repository
          </h2>

          <p className="text-xs text-gray-400">
            Live repository statistics
          </p>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-4">

        <Stat
          icon={<Star size={16} />}
          label="Stars"
          value={repo.stars}
        />

        <Stat
          icon={<GitFork size={16} />}
          label="Forks"
          value={repo.forks}
        />

        <Stat
          icon={<Eye size={16} />}
          label="Watchers"
          value={repo.watchers}
        />

        <Stat
          icon={<AlertCircle size={16} />}
          label="Issues"
          value={repo.issues}
        />

      </div>

      <div className="mt-6 space-y-3">

        <div className="flex items-center justify-between">

          <span className="flex items-center gap-2 text-sm text-gray-400">

            <Code2 size={15} />

            Language

          </span>

          <span className="text-white">
            {repo.language || "-"}
          </span>

        </div>

        <div className="flex items-center justify-between">

          <span className="flex items-center gap-2 text-sm text-gray-400">

            <GitBranch size={15} />

            Branch

          </span>

          <span className="text-white">
            {repo.defaultBranch}
          </span>

        </div>

      </div>

      <a
        href={repo.htmlUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-3 font-semibold text-black transition hover:bg-cyan-400"
      >
        <ExternalLink size={18} />
        Open Repository
      </a>

    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#0B1220] p-4">

      <div className="mb-2 text-cyan-400">
        {icon}
      </div>

      <div className="text-xl font-bold text-white">
        {value}
      </div>

      <div className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </div>

    </div>
  );
}

export default GitHubRepositoryCard;