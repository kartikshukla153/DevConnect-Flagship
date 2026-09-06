import { useEffect, useState } from "react";
import axios from "axios";
import {
  FolderGit2,
  CheckCircle2,
  MessageCircle,
  Bell,
  ArrowUpRight,
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

function FeedStats() {
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    messages: 0,
    notifications: 0,
  });

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const results = await Promise.allSettled([
          axios.get(`${API}/projects`, { headers }),
          axios.get(`${API}/tasks`, { headers }),
          axios.get(`${API}/conversations`, { headers }),
          axios.get(`${API}/notifications`, { headers }),
        ]);

        if (!mounted) return;

        const [projectsResult, tasksResult, conversationsResult, notificationsResult] =
          results;

        const projects =
          projectsResult.status === "fulfilled"
            ? getArray(projectsResult.value.data, [
                "projects",
                "data",
                "results",
              ])
            : [];

        const tasks =
          tasksResult.status === "fulfilled"
            ? getArray(tasksResult.value.data, [
                "tasks",
                "data",
                "results",
              ])
            : [];

        const conversations =
          conversationsResult.status === "fulfilled"
            ? getArray(conversationsResult.value.data, [
                "conversations",
                "data",
                "results",
              ])
            : [];

        const notifications =
          notificationsResult.status === "fulfilled"
            ? getArray(notificationsResult.value.data, [
                "notifications",
                "data",
                "results",
              ])
            : [];

        const completedTasks = tasks.filter((task) => {
          const status = String(task.status || "").toLowerCase();

          return (
            status === "completed" ||
            status === "done" ||
            status === "complete"
          );
        }).length;

        const unreadNotifications = notifications.filter(
          (notification) =>
            notification.read === false ||
            notification.isRead === false
        ).length;

        setStats({
          projects: projects.length,
          tasks: completedTasks,
          messages: conversations.length,
          notifications: unreadNotifications,
        });
      } catch (error) {
        console.error("Feed stats error:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [token]);

  const cards = [
    {
      title: "Projects",
      value: stats.projects,
      description: "Projects in your workspace",
      icon: FolderGit2,
      iconClass: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
      border: "hover:border-cyan-500/30",
    },
    {
      title: "Completed tasks",
      value: stats.tasks,
      description: "Tasks completed across projects",
      icon: CheckCircle2,
      iconClass: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/30",
    },
    {
      title: "Conversations",
      value: stats.messages,
      description: "Active conversations",
      icon: MessageCircle,
      iconClass: "text-violet-400",
      iconBg: "bg-violet-500/10",
      border: "hover:border-violet-500/30",
    },
    {
      title: "Notifications",
      value: stats.notifications,
      description: "Unread notifications",
      icon: Bell,
      iconClass: "text-amber-400",
      iconBg: "bg-amber-500/10",
      border: "hover:border-amber-500/30",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.title}
            className={`group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0F172A] p-6 transition-all duration-300 hover:-translate-y-1 ${card.border} hover:shadow-xl hover:shadow-black/20`}
          >
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/[0.025] blur-3xl" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {card.title}
                </p>

                <div className="mt-4">
                  {loading ? (
                    <div className="h-10 w-16 animate-pulse rounded-lg bg-white/[0.06]" />
                  ) : (
                    <p className="text-4xl font-black tracking-tight text-white">
                      {card.value}
                    </p>
                  )}
                </div>

                <p className="mt-3 max-w-[190px] text-xs leading-5 text-slate-500">
                  {card.description}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}
              >
                <Icon size={22} className={card.iconClass} />
              </div>
            </div>

            <div className="relative mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                Live data
              </span>

              <ArrowUpRight
                size={16}
                className="text-slate-600 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-400"
              />
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default FeedStats;