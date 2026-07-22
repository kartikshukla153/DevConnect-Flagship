import { Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Newspaper,
  FolderKanban,
  Briefcase,
  Users,
  MessageSquare,
  Bell,
  User,
  Bot,
  LogOut,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const { id } = useParams();

  const projectId =
    location.pathname.startsWith("/workspace")
      ? id
      : location.pathname.startsWith("/projects/")
      ? id
      : null;

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Feed",
      icon: Newspaper,
      path: "/feed",
    },
    {
      label: "Projects",
      icon: FolderKanban,
      path: "/projects",
    },
    {
      label: "Workspace",
      icon: Briefcase,
      path: projectId ? `/workspace/${projectId}` : null,
    },
    {
      label: "Developers",
      icon: Users,
      path: "/developers",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/messages",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/notifications",
    },
    {
      label: "Profile",
      icon: User,
      path: "/profile",
    },
    {
      label: "AI Architect",
      icon: Bot,
      path: "/ai",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[270px] flex-col border-r border-[#222E3F] bg-[#0F172A]">

      <div className="border-b border-[#222E3F] px-7 py-7">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400 text-2xl font-bold text-black">
            D
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              DevConnect
            </h1>

            <p className="text-sm text-slate-400">
              Developer Workspace
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-5 py-6">

        {navItems.map((item) => {

          const Icon = item.icon;

          const active =
            location.pathname === item.path ||
            (item.path === "/projects" &&
              location.pathname.startsWith("/projects")) ||
            (item.label === "Workspace" &&
              location.pathname.startsWith("/workspace"));

          if (!item.path) {
            return (
              <div
                key={item.label}
                className="flex cursor-not-allowed items-center gap-4 rounded-2xl px-5 py-4 text-[17px] font-medium text-slate-600 opacity-60"
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`group flex items-center gap-4 rounded-2xl px-5 py-4 text-[17px] font-medium transition-all duration-300 ${
                active
                  ? "bg-cyan-400 text-black shadow-lg shadow-cyan-500/20"
                  : "text-slate-300 hover:bg-white/5 hover:text-cyan-300"
              }`}
            >
              <Icon size={22} />
              <span>{item.label}</span>
            </Link>
          );
        })}

      </nav>

      <div className="border-t border-[#222E3F] p-5">
        <button className="flex w-full items-center gap-4 rounded-2xl bg-red-500/10 px-5 py-4 text-[17px] text-red-300 transition hover:bg-red-500/20">
          <LogOut size={22} />
          Logout
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;