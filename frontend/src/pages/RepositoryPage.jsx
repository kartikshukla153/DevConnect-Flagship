import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  fetchRepository,
  fetchCommits,
} from "../api/github";

import {
  Star,
  GitFork,
  Eye,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  GitBranch,
  Clock,
  HardDrive,
  Globe,
} from "lucide-react";

function RepositoryPage() {
  const { id } = useParams();

  const [repository, setRepository] = useState(null);
  const [commits, setCommits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRepository();
  }, [id]);

  async function loadRepository() {
    try {
      setLoading(true);
      setError("");

      const repo = await fetchRepository(id);
      const commitList = await fetchCommits(id);

      setRepository(repo);
      setCommits(commitList);
    } catch (err) {
      console.log(err);

      setError(
        err?.response?.data?.message ||
          "Unable to load repository."
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshRepository() {
    try {
      setRefreshing(true);

      const repo = await fetchRepository(id);
      const commitList = await fetchCommits(id);

      setRepository(repo);
      setCommits(commitList);
    } catch (err) {
      console.log(err);
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] text-white">
        <div className="mx-auto max-w-7xl p-8">

          <div className="animate-pulse">

            <div className="h-56 rounded-3xl bg-[#111827]" />

            <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">

              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-[#111827]"
                />
              ))}

            </div>

          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1220]">

        <div className="rounded-3xl border border-red-500/30 bg-[#111827] p-10 text-center">

          <AlertCircle
            size={55}
            className="mx-auto text-red-400"
          />

          <h2 className="mt-5 text-2xl font-bold text-white">
            Repository Error
          </h2>

          <p className="mt-3 text-slate-400">
            {error}
          </p>

          <button
            onClick={loadRepository}
            className="mt-8 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  if (!repository) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1220] text-slate-400">
        Repository not connected.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">

      <div className="mx-auto max-w-7xl space-y-8 p-8">

        {/* HERO */}

        <section className="rounded-3xl border border-slate-800 bg-[#111827] p-10">

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[4px] text-cyan-400">
                Repository
              </p>

              <h1 className="mt-4 text-5xl font-black">
                {repository.fullName}
              </h1>

              <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-400">
                {repository.description ||
                  "No repository description."}
              </p>

            </div>

            <div className="flex gap-4">

              <button
                onClick={refreshRepository}
                className="flex items-center gap-2 rounded-xl border border-cyan-500 px-5 py-3 text-cyan-400 transition hover:bg-cyan-500 hover:text-black"
              >
                <RefreshCw
                  size={18}
                  className={
                    refreshing ? "animate-spin" : ""
                  }
                />

                Refresh
              </button>

              <a
                href={repository.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-black transition hover:bg-cyan-400"
              >
                <ExternalLink size={18} />

                Open on GitHub
              </a>

            </div>

          </div>
        </section>
                {/* ============================
            STATS
        ============================ */}

        <section className="grid grid-cols-2 gap-6 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

            <div className="mb-4 flex items-center justify-between">
              <Star className="text-yellow-400" size={22} />
              <span className="text-xs uppercase tracking-widest text-slate-500">
                Stars
              </span>
            </div>

            <h2 className="text-4xl font-black">
              {repository.stars?.toLocaleString()}
            </h2>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

            <div className="mb-4 flex items-center justify-between">
              <GitFork className="text-cyan-400" size={22} />
              <span className="text-xs uppercase tracking-widest text-slate-500">
                Forks
              </span>
            </div>

            <h2 className="text-4xl font-black">
              {repository.forks?.toLocaleString()}
            </h2>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

            <div className="mb-4 flex items-center justify-between">
              <Eye className="text-emerald-400" size={22} />
              <span className="text-xs uppercase tracking-widest text-slate-500">
                Watchers
              </span>
            </div>

            <h2 className="text-4xl font-black">
              {repository.watchers?.toLocaleString()}
            </h2>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6">

            <div className="mb-4 flex items-center justify-between">
              <AlertCircle className="text-red-400" size={22} />
              <span className="text-xs uppercase tracking-widest text-slate-500">
                Issues
              </span>
            </div>

            <h2 className="text-4xl font-black">
              {repository.openIssues?.toLocaleString()}
            </h2>

          </div>

        </section>

        {/* ============================
            REPOSITORY OVERVIEW
        ============================ */}

        <section className="rounded-3xl border border-slate-800 bg-[#111827] p-8">

          <div className="mb-8 flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Repository Overview
            </h2>

            <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
              {repository.visibility}
            </div>

          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">

              <div className="mb-3 flex items-center gap-3">
                <GitBranch
                  size={20}
                  className="text-cyan-400"
                />
                <span className="text-sm text-slate-400">
                  Default Branch
                </span>
              </div>

              <h3 className="text-xl font-bold">
                {repository.defaultBranch}
              </h3>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">

              <div className="mb-3 flex items-center gap-3">
                <Globe
                  size={20}
                  className="text-cyan-400"
                />
                <span className="text-sm text-slate-400">
                  Language
                </span>
              </div>

              <h3 className="text-xl font-bold">
                {repository.language || "Unknown"}
              </h3>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">

              <div className="mb-3 flex items-center gap-3">
                <HardDrive
                  size={20}
                  className="text-cyan-400"
                />
                <span className="text-sm text-slate-400">
                  Repository Size
                </span>
              </div>

              <h3 className="text-xl font-bold">
                {repository.size} KB
              </h3>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">

              <div className="mb-3 flex items-center gap-3">
                <Clock
                  size={20}
                  className="text-cyan-400"
                />
                <span className="text-sm text-slate-400">
                  Created
                </span>
              </div>

              <h3 className="text-base font-semibold">
                {new Date(
                  repository.createdAt
                ).toLocaleDateString()}
              </h3>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">

              <div className="mb-3 flex items-center gap-3">
                <Clock
                  size={20}
                  className="text-cyan-400"
                />
                <span className="text-sm text-slate-400">
                  Updated
                </span>
              </div>

              <h3 className="text-base font-semibold">
                {new Date(
                  repository.updatedAt
                ).toLocaleString()}
              </h3>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-5">

              <div className="mb-3 flex items-center gap-3">
                <Clock
                  size={20}
                  className="text-cyan-400"
                />
                <span className="text-sm text-slate-400">
                  Last Push
                </span>
              </div>

              <h3 className="text-base font-semibold">
                {new Date(
                  repository.pushedAt
                ).toLocaleString()}
              </h3>

            </div>

          </div>

        </section>
                {/* ============================
            RECENT COMMITS
        ============================ */}

        <section className="rounded-3xl border border-slate-800 bg-[#111827] p-8">

          <div className="mb-8 flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Recent Commits
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Latest development activity from GitHub
              </p>

            </div>

            <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
              {commits.length} Commits
            </div>

          </div>

          <div className="space-y-5">

            {commits.length === 0 && (

              <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-10 text-center">

                <p className="text-slate-400">
                  No commits found.
                </p>

              </div>

            )}

            {commits.map((commit) => (

              <div
                key={commit.sha}
                className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6 transition duration-300 hover:border-cyan-500"
              >

                <div className="flex gap-5">

                  <img
                    src={
                      commit.avatar ||
                      "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
                    }
                    alt=""
                    className="h-12 w-12 rounded-full border border-slate-700"
                  />

                  <div className="flex-1">

                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">

                      <h3 className="text-lg font-semibold leading-7">
                        {commit.message}
                      </h3>

                      <a
                        href={commit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                      >
                        View

                        <ExternalLink size={16} />

                      </a>

                    </div>

                    <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-400">

                      <span>
                        👤 {commit.author}
                      </span>

                      <span>
                        🕒{" "}
                        {new Date(
                          commit.date
                        ).toLocaleString()}
                      </span>

                    </div>

                    <div className="mt-4 rounded-lg bg-black/40 px-4 py-3">

                      <code className="font-mono text-xs tracking-wider text-cyan-400">

                        {commit.sha}

                      </code>

                    </div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>
                {/* ============================
            FOOTER
        ============================ */}

        <footer className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-[#111827] p-6 text-sm text-slate-400 lg:flex-row">

          <div>
            Connected Repository:
            <span className="ml-2 font-semibold text-cyan-400">
              {repository.fullName}
            </span>
          </div>

          <div className="flex items-center gap-6">

            <span>
              ⭐ {repository.stars}
            </span>

            <span>
              🍴 {repository.forks}
            </span>

            <span>
              👀 {repository.watchers}
            </span>

          </div>

        </footer>

      </div>
    </div>
  );
}

export default RepositoryPage;