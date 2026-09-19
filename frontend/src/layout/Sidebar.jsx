import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  LayoutDashboard,
  Newspaper,
  FolderKanban,
  BriefcaseBusiness,
  Users,
  UsersRound,
  MessageSquare,
  Bell,
  User,
  Bot,
  LogOut,
} from "lucide-react";

import { getSocket } from "../socket/socket";

const API = "http://localhost:5000/api";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [unreadMessages, setUnreadMessages] =
    useState(0);

  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const currentUserId =
    currentUser.id ||
    currentUser._id ||
    null;

  /*
   * Workspace is available whenever we are inside a project route:
   *
   * /projects/:id
   * /projects/:id/...
   * /workspace/:id
   */
  const projectId =
    id ||
    (location.pathname.startsWith("/workspace/")
      ? location.pathname.split("/")[2]
      : null);

  const isWorkspaceRoute =
    location.pathname.startsWith("/workspace/");

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    if (path === "/feed") {
      return location.pathname === "/feed";
    }

    if (path === "/projects") {
      return (
        location.pathname === "/projects" ||
        location.pathname.startsWith("/projects/")
      );
    }

    if (path === "/developers") {
      return (
        location.pathname === "/developers" ||
        location.pathname.startsWith("/developers/")
      );
    }

    if (path === "/connections") {
      return location.pathname === "/connections";
    }

    if (path === "/messages") {
      return location.pathname === "/messages";
    }

    if (path === "/notifications") {
      return location.pathname === "/notifications";
    }

    if (path === "/profile") {
      return location.pathname === "/profile";
    }

    if (path === "/ai") {
      return (
        location.pathname === "/ai" ||
        location.pathname === "/ai-review"
      );
    }

    return location.pathname === path;
  };

  /*
   * ---------------------------------------------------------
   * UNREAD MESSAGE COUNT
   * ---------------------------------------------------------
   */

  const fetchUnreadMessages = async () => {
    if (!token) {
      setUnreadMessages(0);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const conversations =
        response.data?.conversations || [];

      const totalUnread = conversations.reduce(
        (total, conversation) =>
          total +
          Number(conversation.unreadCount || 0),
        0
      );

      setUnreadMessages(totalUnread);
    } catch (error) {
      console.error(
        "FETCH GLOBAL UNREAD MESSAGE COUNT ERROR:",
        error.response?.data ||
          error.message
      );
    }
  };

  /*
   * Initial unread count + refresh when the user
   * navigates around the application.
   */
  useEffect(() => {
    fetchUnreadMessages();
  }, [token, location.pathname]);

  /*
   * Real-time message/read events.
   */
  useEffect(() => {
    const socket = getSocket();

    if (!socket) return;

    const handleNewMessage = (message) => {
      const senderId =
        typeof message.sender === "string"
          ? message.sender
          : message.sender?._id;

      /*
       * Never count messages sent by ourselves.
       */
      if (
        currentUserId &&
        senderId &&
        String(senderId) ===
          String(currentUserId)
      ) {
        return;
      }

      /*
       * The server sends newMessage only to the
       * other participant, so this represents a
       * genuinely incoming message.
       */
      setUnreadMessages((previous) =>
        Math.min(previous + 1, 999)
      );
    };

    const handleMessagesSeen = ({
      conversationId,
      userId,
    }) => {
      /*
       * This event means that the current user
       * has marked messages in a conversation
       * as read.
       *
       * Re-fetching is intentional here:
       * the backend is the source of truth and
       * there may be multiple unread conversations.
       */
      if (
        userId &&
        currentUserId &&
        String(userId) !==
          String(currentUserId)
      ) {
        return;
      }

      fetchUnreadMessages();
    };

    /*
     * Custom browser event emitted by ChatWindow
     * immediately after the current conversation
     * is successfully marked as read.
     */
    const handleLocalMessagesRead = () => {
      fetchUnreadMessages();
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    socket.on(
      "messagesSeen",
      handleMessagesSeen
    );

    window.addEventListener(
      "devconnect:messages-read",
      handleLocalMessagesRead
    );

    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );

      socket.off(
        "messagesSeen",
        handleMessagesSeen
      );

      window.removeEventListener(
        "devconnect:messages-read",
        handleLocalMessagesRead
      );
    };
  }, [currentUserId, token]);

  const navItemsBeforeWorkspace = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Feed",
      path: "/feed",
      icon: Newspaper,
    },
    {
      label: "Projects",
      path: "/projects",
      icon: FolderKanban,
    },
  ];

  const navItemsAfterWorkspace = [
    {
      label: "Developers",
      path: "/developers",
      icon: Users,
    },
    {
      label: "Connections",
      path: "/connections",
      icon: UsersRound,
    },
    {
      label: "Messages",
      path: "/messages",
      icon: MessageSquare,
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: Bell,
    },
    {
      label: "Profile",
      path: "/profile",
      icon: User,
    },
    {
      label: "AI Architect",
      path: "/ai",
      icon: Bot,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    const showUnreadBadge =
      item.label === "Messages" &&
      unreadMessages > 0;

    return (
      <Link
        key={item.path}
        to={item.path}
        className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
          active
            ? "bg-cyan-400/10 text-cyan-300"
            : "text-gray-300 hover:bg-[#111827] hover:text-white"
        }`}
      >
        <Icon
          size={19}
          className={`shrink-0 transition-colors ${
            active
              ? "text-cyan-400"
              : "text-gray-400 group-hover:text-cyan-300"
          }`}
        />

        <span>{item.label}</span>

        {showUnreadBadge && (
          <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1.5 text-[10px] font-black leading-none text-[#0B1220] shadow-lg shadow-cyan-400/20">
            {unreadMessages > 99
              ? "99+"
              : unreadMessages}
          </span>
        )}

        {item.label === "Connections" &&
          active && (
            <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />
          )}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[270px] border-r border-[#263243] bg-[#0B1220] lg:block">
      <div className="flex h-full flex-col">
        {/* Brand */}

        <div className="flex h-[92px] items-center border-b border-[#263243] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-xl font-black text-[#0B1220]">
              D
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                DevConnect
              </h1>

              <p className="text-xs text-cyan-300">
                Developer Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            {/* Dashboard / Feed / Projects */}

            {navItemsBeforeWorkspace.map(
              renderNavItem
            )}

            {/* ===================================================== */}
            {/* WORKSPACE                                             */}
            {/* ===================================================== */}

            {projectId ? (
              <Link
                to={`/workspace/${projectId}`}
                className={`group flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isWorkspaceRoute
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-gray-300 hover:bg-[#111827] hover:text-white"
                }`}
              >
                <BriefcaseBusiness
                  size={19}
                  className={
                    isWorkspaceRoute
                      ? "text-cyan-400"
                      : "text-gray-400 group-hover:text-cyan-300"
                  }
                />

                <span>Workspace</span>
              </Link>
            ) : (
              <div
                className="group flex cursor-not-allowed items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-gray-500"
                title="Open a project to access Workspace"
              >
                <BriefcaseBusiness
                  size={19}
                  className="text-gray-600"
                />

                <span>Workspace</span>
              </div>
            )}

            {/* Developers / Connections / Messages / etc. */}

            {navItemsAfterWorkspace.map(
              renderNavItem
            )}
          </div>
        </nav>

        {/* Logout */}

        <div className="border-t border-[#263243] p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-all duration-200 hover:bg-red-500/15 hover:text-red-200"
          >
            <LogOut size={19} />

            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;