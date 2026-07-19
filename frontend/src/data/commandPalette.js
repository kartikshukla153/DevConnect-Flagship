import {
  LayoutDashboard,
  Newspaper,
  MessageSquare,
  Users,
  FolderKanban,
  Bell,
  User,
  Sparkles,
  PlusCircle,
  FolderPlus,
  Settings,
  LogOut,
} from "lucide-react";

const commands = [
  // =========================
  // Navigation
  // =========================

  {
    id: "dashboard",
    group: "Navigation",
    title: "Dashboard",
    description: "Go to your dashboard",
    icon: LayoutDashboard,
    keywords: ["home", "overview", "main"],
    shortcut: "G D",
    action: ({ navigate }) => navigate("/dashboard"),
  },

  {
    id: "feed",
    group: "Navigation",
    title: "Feed",
    description: "Open developer feed",
    icon: Newspaper,
    keywords: ["posts", "timeline", "social"],
    shortcut: "G F",
    action: ({ navigate }) => navigate("/feed"),
  },

  {
    id: "messages",
    group: "Navigation",
    title: "Messages",
    description: "Open your conversations",
    icon: MessageSquare,
    keywords: ["chat", "dm", "conversation"],
    shortcut: "G M",
    action: ({ navigate }) => navigate("/messages"),
  },

  {
    id: "developers",
    group: "Navigation",
    title: "Developers",
    description: "Browse developers",
    icon: Users,
    keywords: ["people", "community", "network"],
    shortcut: "G U",
    action: ({ navigate }) => navigate("/developers"),
  },

  {
    id: "projects",
    group: "Navigation",
    title: "Projects",
    description: "View all projects",
    icon: FolderKanban,
    keywords: ["workspace", "repository", "teams"],
    shortcut: "G P",
    action: ({ navigate }) => navigate("/projects"),
  },

  {
    id: "notifications",
    group: "Navigation",
    title: "Notifications",
    description: "View notifications",
    icon: Bell,
    keywords: ["alerts", "activity"],
    shortcut: "G N",
    action: ({ navigate }) => navigate("/notifications"),
  },

  {
    id: "profile",
    group: "Navigation",
    title: "Profile",
    description: "Open your profile",
    icon: User,
    keywords: ["account", "me"],
    shortcut: "G R",
    action: ({ navigate }) => navigate("/profile"),
  },

  // =========================
  // Quick Actions
  // =========================

  {
    id: "create-project",
    group: "Quick Actions",
    title: "Create Project",
    description: "Start a new collaboration project",
    icon: FolderPlus,
    keywords: ["new", "workspace"],
    shortcut: "⌘ P",
    action: ({ navigate }) => navigate("/projects/create"),
  },

  {
    id: "new-post",
    group: "Quick Actions",
    title: "Create Post",
    description: "Share something with developers",
    icon: PlusCircle,
    keywords: ["feed", "publish"],
    shortcut: "⌘ ⇧ P",
    action: () => {
      console.log("Create Post");
    },
  },

  // =========================
  // AI
  // =========================

  {
    id: "ai",
    group: "AI",
    title: "AI Architect",
    description: "Open AI Architect",
    icon: Sparkles,
    keywords: ["assistant", "copilot", "chatgpt"],
    shortcut: "⌘ A",
    action: ({ navigate }) => navigate("/ai"),
  },

  // =========================
  // Account
  // =========================

  {
    id: "settings",
    group: "Account",
    title: "Settings",
    description: "Application settings",
    icon: Settings,
    keywords: ["preferences"],
    shortcut: "⌘ ,",
    action: () => {
      console.log("Settings");
    },
  },

  {
    id: "logout",
    group: "Account",
    title: "Logout",
    description: "Sign out of DevConnect",
    icon: LogOut,
    keywords: ["exit", "signout"],
    shortcut: "",
    action: () => {
      localStorage.removeItem("token");
      window.location.href = "/login";
    },
  },
];

export default commands;