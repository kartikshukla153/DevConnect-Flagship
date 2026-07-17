import {
  LayoutDashboard,
  Newspaper,
  Users,
  MessageSquare,
  Bell,
  User,
  Bot,
  FolderKanban,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Feed",
    icon: Newspaper,
    path: "/feed",
  },
  {
  name: "Projects",
  icon: FolderKanban,
  path: "/projects",
},
  {
    name: "Developers",
    icon: Users,
    path: "/developers",
  },
  {
    name: "Messages",
    icon: MessageSquare,
    path: "/messages",
  },
  {
    name: "Notifications",
    icon: Bell,
    path: "/notifications",
  },
  {
    name: "Profile",
    icon: User,
    path: "/profile",
  },
  {
    name: "AI Architect",
    icon: Bot,
    path: "/ai",
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[270px] border-r border-white/10 bg-[#111827] lg:flex lg:flex-col">
      {/* Logo */}

      <div className="border-b border-white/10 p-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-xl font-bold text-black shadow-lg shadow-cyan-500/20">
            D
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide">
              DevConnect
            </h1>

            <p className="text-xs text-gray-400">
              Developer Workspace
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 p-5">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-400 text-black shadow-lg shadow-cyan-500/20"
                    : "text-gray-300 hover:bg-[#1F2937] hover:text-white"
                }`
              }
            >
              <Icon size={20} />

              <span className="font-medium">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}

      <div className="border-t border-white/10 p-5">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl bg-red-500/10 px-4 py-3 text-red-400 transition hover:bg-red-500 hover:text-white"
        >
          <LogOut size={20} />

          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;