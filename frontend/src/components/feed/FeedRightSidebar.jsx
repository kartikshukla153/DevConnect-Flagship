import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  FolderKanban,
  ArrowRight,
  Sparkles,
  Layers3,
} from "lucide-react";

const API = "http://localhost:5000/api";

function getArray(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  return [];
}

function FeedRightSidebar() {
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const loadSidebarData = async () => {
      try {
        const [postsResult, projectsResult] = await Promise.allSettled([
          axios.get(`${API}/posts?limit=50`, { headers }),
          axios.get(`${API}/projects`, { headers }),
        ]);

        if (postsResult.status === "fulfilled") {
          setPosts(
            getArray(postsResult.value.data, [
              "posts",
              "data",
              "results",
            ])
          );
        }

        if (projectsResult.status === "fulfilled") {
          setProjects(
            getArray(projectsResult.value.data, [
              "projects",
              "data",
              "results",
            ])
          );
        }
      } catch (error) {
        console.error("Feed sidebar error:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    loadSidebarData();
  }, [token]);

  /*
   * Extract technology hashtags from REAL posts.
   *
   * We intentionally do not maintain a fake hardcoded list.
   */
  const trendingTechnologies = useMemo(() => {
    const counts = new Map();

    posts.forEach((post) => {
      const content = String(post.content || "");

      const hashtags = content.match(/#[a-zA-Z0-9_-]+/g) || [];

      hashtags.forEach((tag) => {
        const normalized = tag.toLowerCase();

        counts.set(
          normalized,
          (counts.get(normalized) || 0) + 1
        );
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({
        tag,
        count,
      }));
  }, [posts]);

  const activeProjects = useMemo(() => {
    return projects
      .filter((project) => {
        const status = String(project.status || "").toLowerCase();

        return (
          !status ||
          status === "active" ||
          status === "in-progress" ||
          status === "ongoing"
        );
      })
      .slice(0, 4);
  }, [projects]);

  return (
    <aside className="space-y-5">
      {/* Trending technologies */}
      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0F172A]">
        <div className="border-b border-white/[0.07] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
              <TrendingUp
                size={18}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Trending technologies
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Based on real posts
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {trendingTechnologies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] px-5 py-8 text-center">
              <Layers3
                size={22}
                className="mx-auto text-slate-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                No technology trends yet.
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Use hashtags like #React or #NodeJS in posts
                to build the live trend data.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {trendingTechnologies.map((technology) => (
                <button
                  key={technology.tag}
                  type="button"
                  className="group rounded-full border border-white/[0.08] bg-[#0B1220] px-3.5 py-2 text-xs font-medium text-slate-400 transition-all duration-200 hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-300"
                >
                  {technology.tag}

                  <span className="ml-1.5 text-[10px] text-slate-600 group-hover:text-cyan-500">
                    {technology.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Active projects */}
      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0F172A]">
        <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
              <FolderKanban
                size={18}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h2 className="font-bold text-white">
                Active projects
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                From your workspace
              </p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {loadingProjects ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-2xl bg-white/[0.025]"
                />
              ))}
            </div>
          ) : activeProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] px-5 py-8 text-center">
              <FolderKanban
                size={22}
                className="mx-auto text-slate-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                No active projects.
              </p>

              <p className="mt-1 text-xs text-slate-600">
                Your real projects will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <button
                  key={project._id}
                  type="button"
                  className="group w-full rounded-2xl border border-white/[0.07] bg-[#0B1220] p-4 text-left transition-all duration-200 hover:border-cyan-500/30 hover:bg-[#101B2D]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {project.title ||
                          project.name ||
                          "Untitled project"}
                      </h3>

                      {project.description && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <ArrowRight
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-cyan-400"
                    />
                  </div>

                  {Array.isArray(project.members) && (
                    <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-600">
                      {project.members.length}{" "}
                      {project.members.length === 1
                        ? "member"
                        : "members"}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product principle */}
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.08] via-sky-500/[0.04] to-transparent p-6">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10">
              <Sparkles
                size={17}
                className="text-cyan-400"
              />
            </div>

            <h2 className="font-bold text-white">
              Build in public
            </h2>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Share what you're building, document engineering
            decisions, and collaborate with developers through
            the workspace.
          </p>
        </div>
      </section>
    </aside>
  );
}

export default FeedRightSidebar;