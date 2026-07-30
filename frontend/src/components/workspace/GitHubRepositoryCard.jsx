import { useEffect, useState } from "react";

import {
  
  Star,
  GitFork,
  AlertCircle,
  Eye,
  Code2,
  RefreshCw,
  Link2,
} from "lucide-react";
import {
  fetchRepository,
  connectRepository,
} from "../../api/github";

function GitHubRepositoryCard({ projectId }) {
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    loadRepository();
  }, [projectId]);

  async function loadRepository() {
    try {
      setLoading(true);

      const data = await fetchRepository(projectId);

      setRepo(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    const url = window.prompt(
      "Paste GitHub Repository URL"
    );

    if (!url) return;

    try {
      setConnecting(true);

      await connectRepository(projectId, url);

      await loadRepository();
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message ||
          "Unable to connect repository."
      );
    } finally {
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <p className="text-sm text-slate-400">
          Loading Repository...
        </p>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-black">
  GH
</div>

          <h3 className="font-semibold text-white">
            GitHub Repository
          </h3>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Connect your repository to unlock
          repository insights.
        </p>

        <button
          onClick={handleConnect}
          disabled={connecting}
          className="mt-5 rounded-xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-cyan-400"
        >
          {connecting
            ? "Connecting..."
            : "Connect Repository"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500 text-sm font-bold text-black">
  GH
</div>

          <div>
            <h3 className="font-semibold text-white">
              {repo.name}
            </h3>

            <p className="text-xs text-slate-400">
              Connected Repository
            </p>
          </div>

        </div>

        <button
          onClick={loadRepository}
          className="rounded-lg p-2 hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4 text-slate-400" />
        </button>

      </div>

      <p className="mt-5 text-sm text-slate-400">
        {repo.description || "No description."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div className="rounded-xl bg-[#0B1220] p-4">
          <div className="flex items-center gap-2">

            <Star className="h-4 w-4 text-yellow-400" />

            <span className="text-sm text-slate-300">
              Stars
            </span>

          </div>

          <p className="mt-2 text-xl font-bold text-white">
            {repo.stars}
          </p>
        </div>

        <div className="rounded-xl bg-[#0B1220] p-4">
          <div className="flex items-center gap-2">

            <GitFork className="h-4 w-4 text-cyan-400" />

            <span className="text-sm text-slate-300">
              Forks
            </span>

          </div>

          <p className="mt-2 text-xl font-bold text-white">
            {repo.forks}
          </p>
        </div>

        <div className="rounded-xl bg-[#0B1220] p-4">
          <div className="flex items-center gap-2">

            <AlertCircle className="h-4 w-4 text-red-400" />

            <span className="text-sm text-slate-300">
              Issues
            </span>

          </div>

          <p className="mt-2 text-xl font-bold text-white">
            {repo.openIssues}
          </p>
        </div>

        <div className="rounded-xl bg-[#0B1220] p-4">
          <div className="flex items-center gap-2">

            <Eye className="h-4 w-4 text-green-400" />

            <span className="text-sm text-slate-300">
              Watchers
            </span>

          </div>

          <p className="mt-2 text-xl font-bold text-white">
            {repo.watchers}
          </p>
        </div>

      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl bg-[#0B1220] p-4">

        <div className="flex items-center gap-2">

          <Code2 className="h-4 w-4 text-cyan-400" />

          <span className="text-sm text-slate-300">
            {repo.language || "Unknown"}
          </span>

        </div>

        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
        >
          <Link2 className="h-4 w-4" />
          Open
        </a>

      </div>

    </div>
  );
}

export default GitHubRepositoryCard;