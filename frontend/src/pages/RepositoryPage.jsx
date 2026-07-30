import { useEffect, useState } from "react";
import { fetchCommits } from "../api/github";
import { useParams } from "react-router-dom";

import { fetchRepository } from "../api/github";

function RepositoryPage() {
  const { id } = useParams();

  const [repository, setRepository] = useState(null);
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepository();
  }, [id]);

  async function loadRepository() {
    try {
      setLoading(true);

      const repo = await fetchRepository(id);

const commitsData = await fetchCommits(id);

setRepository(repo);

setCommits(commitsData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-slate-400">
        Loading Repository...
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-red-400">
        No Repository Connected
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">

      <div className="mx-auto max-w-7xl space-y-8 p-8">

        {/* Header */}

        <div className="rounded-3xl border border-slate-800 bg-[#111827] p-8">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase tracking-widest text-cyan-400">
                Repository
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {repository.fullName}
              </h1>

              <p className="mt-3 max-w-3xl text-slate-400">
                {repository.description || "No description provided."}
              </p>

            </div>

            <a
              href={repository.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black transition hover:bg-cyan-400"
            >
              Open on GitHub
            </a>

          </div>

        </div>

        {/* Stats */}

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <p className="text-sm text-slate-400">⭐ Stars</p>
            <h2 className="mt-3 text-3xl font-bold">
              {repository.stars}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <p className="text-sm text-slate-400">🍴 Forks</p>
            <h2 className="mt-3 text-3xl font-bold">
              {repository.forks}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <p className="text-sm text-slate-400">👀 Watchers</p>
            <h2 className="mt-3 text-3xl font-bold">
              {repository.watchers}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">
            <p className="text-sm text-slate-400">⚠ Open Issues</p>
            <h2 className="mt-3 text-3xl font-bold">
              {repository.openIssues}
            </h2>
          </div>

        </div>

        {/* Overview */}

        <div className="rounded-3xl border border-slate-800 bg-[#111827] p-8">

          <h2 className="mb-6 text-2xl font-bold">
            Repository Overview
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <p className="text-sm text-slate-400">
                Owner
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {repository.owner}
              </h3>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Language
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {repository.language || "Unknown"}
              </h3>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Visibility
              </p>

              <h3 className="mt-2 text-lg font-semibold capitalize">
                {repository.visibility}
              </h3>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Default Branch
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {repository.defaultBranch}
              </h3>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Repository Size
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {repository.size} KB
              </h3>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Last Updated
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                {new Date(repository.updatedAt).toLocaleString()}
              </h3>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
{/* ===========================
Recent Commits
=========================== */}

<div className="rounded-3xl border border-slate-800 bg-[#111827] p-8">

  <div className="mb-8 flex items-center justify-between">

    <div>

      <h2 className="text-2xl font-bold">
        Recent Commits
      </h2>

      <p className="text-sm text-slate-400">
        Latest development activity
      </p>

    </div>

    <div className="rounded-xl bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-400">
      {commits.length} Commits
    </div>

  </div>

  <div className="space-y-5">

    {commits.map((commit) => (

      <div
        key={commit.sha}
        className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-[#0B1220] p-5 transition hover:border-cyan-500"
      >

        <img
          src={
            commit.avatar ||
            "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
          }
          alt=""
          className="h-12 w-12 rounded-full"
        />

        <div className="flex-1">

          <h3 className="font-semibold text-white">
            {commit.message}
          </h3>

          <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">

            <span>
              {commit.author}
            </span>

            <span>•</span>

            <span>
              {new Date(commit.date).toLocaleString()}
            </span>

          </div>

          <p className="mt-3 font-mono text-xs text-cyan-400">

            {commit.sha.substring(0, 8)}

          </p>

        </div>

      </div>

    ))}

  </div>

</div>

export default RepositoryPage;