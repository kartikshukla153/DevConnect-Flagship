import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  UserPlus,
  Heart,
  MessageCircle,
  CheckCircle2,
  Clock3,
  Check,
  CheckCheck,
  X,
  Loader2,
  FolderKanban,
  Filter,
  Inbox,
  ArrowRight,
  Sparkles,
  Users,
  HeartHandshake,
  CircleDot,
  RefreshCw,
} from "lucide-react";

import useNotifications from "../hooks/useNotifications";

const API = "http://localhost:5000/api";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "connections", label: "Connections" },
  { key: "projects", label: "Projects" },
  { key: "social", label: "Social" },
];

function Notifications() {
  const { notifications, loading } =
    useNotifications();

  const navigate = useNavigate();

  const [localNotifications, setLocalNotifications] =
    useState([]);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [markingAllRead, setMarkingAllRead] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [lastAction, setLastAction] =
    useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    setLocalNotifications(
      Array.isArray(notifications)
        ? notifications
        : []
    );
  }, [notifications]);

  const unreadCount = useMemo(
    () =>
      localNotifications.filter(
        (notification) =>
          !notification.read
      ).length,
    [localNotifications]
  );

  const getNotificationCategory = (
    notification
  ) => {
    const type = notification?.type || "";

    if (
      type === "connection_request" ||
      type === "connection_accepted"
    ) {
      return "connections";
    }

    if (type === "project_invite") {
      return "projects";
    }

    if (
      type === "post_like" ||
      type === "post_comment"
    ) {
      return "social";
    }

    return "all";
  };

  const getTypeMeta = (type) => {
    switch (type) {
      case "connection_request":
        return {
          category: "connections",
          label: "Connection",
          icon: UserPlus,
          iconClass:
            "text-cyan-300",
          iconBg:
            "border-cyan-400/15 bg-cyan-400/10",
        };

      case "connection_accepted":
        return {
          category: "connections",
          label: "Connection",
          icon: HeartHandshake,
          iconClass:
            "text-emerald-300",
          iconBg:
            "border-emerald-400/15 bg-emerald-400/10",
        };

      case "project_invite":
        return {
          category: "projects",
          label: "Project",
          icon: FolderKanban,
          iconClass:
            "text-violet-300",
          iconBg:
            "border-violet-400/15 bg-violet-400/10",
        };

      case "post_like":
        return {
          category: "social",
          label: "Reaction",
          icon: Heart,
          iconClass:
            "text-pink-300",
          iconBg:
            "border-pink-400/15 bg-pink-400/10",
        };

      case "post_comment":
        return {
          category: "social",
          label: "Comment",
          icon: MessageCircle,
          iconClass:
            "text-emerald-300",
          iconBg:
            "border-emerald-400/15 bg-emerald-400/10",
        };

      default:
        return {
          category: "all",
          label: "Activity",
          icon: Bell,
          iconClass:
            "text-cyan-300",
          iconBg:
            "border-cyan-400/15 bg-cyan-400/10",
        };
    }
  };

  const formatRelativeTime = (date) => {
    if (!date) return "Recently";

    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
      return "Recently";
    }

    const seconds = Math.max(
      0,
      Math.floor(
        (Date.now() - timestamp) / 1000
      )
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days === 1) {
      return "Yesterday";
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return new Date(
      timestamp
    ).toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year:
        new Date(timestamp).getFullYear() !==
        new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
  };

  const getDateGroup = (date) => {
    if (!date) return "Earlier";

    const timestamp = new Date(date).getTime();

    if (Number.isNaN(timestamp)) {
      return "Earlier";
    }

    const now = new Date();
    const target = new Date(timestamp);

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const targetStart = new Date(
      target.getFullYear(),
      target.getMonth(),
      target.getDate()
    );

    const dayDiff = Math.floor(
      (todayStart.getTime() -
        targetStart.getTime()) /
        86400000
    );

    if (dayDiff === 0) return "Today";
    if (dayDiff === 1) return "Yesterday";
    if (dayDiff <= 7) return "This week";

    return "Earlier";
  };

  const filteredNotifications = useMemo(() => {
    return localNotifications.filter(
      (notification) => {
        if (
          activeFilter === "unread" &&
          notification.read
        ) {
          return false;
        }

        if (
          [
            "connections",
            "projects",
            "social",
          ].includes(activeFilter)
        ) {
          return (
            getNotificationCategory(
              notification
            ) === activeFilter
          );
        }

        return true;
      }
    );
  }, [
    activeFilter,
    localNotifications,
  ]);

  const groupedNotifications = useMemo(() => {
    const groups = [
      "Today",
      "Yesterday",
      "This week",
      "Earlier",
    ];

    return groups
      .map((label) => ({
        label,
        items:
          filteredNotifications.filter(
            (notification) =>
              getDateGroup(
                notification.createdAt
              ) === label
          ),
      }))
      .filter(
        (group) => group.items.length > 0
      );
  }, [filteredNotifications]);

  const markAsRead = async (
    notificationId
  ) => {
    if (!notificationId) return;

    const target =
      localNotifications.find(
        (notification) =>
          notification._id ===
          notificationId
      );

    if (!target || target.read) {
      return;
    }

    try {
      await axios.put(
        `${API}/notifications/read/${notificationId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLocalNotifications(
        (current) =>
          current.map((item) =>
            item._id === notificationId
              ? {
                  ...item,
                  read: true,
                }
              : item
          )
      );
    } catch (error) {
      console.error(
        "FAILED TO MARK NOTIFICATION AS READ:",
        error.response?.data ||
          error.message
      );
    }
  };

  const markAllAsRead = async () => {
    if (
      markingAllRead ||
      unreadCount === 0
    ) {
      return;
    }

    setMarkingAllRead(true);
    setActionError("");

    try {
      /*
       * The existing notification contract only
       * exposes an individual read endpoint.
       *
       * Mark all is therefore intentionally built
       * from that same authoritative endpoint
       * rather than inventing a new backend route.
       */
      const unread = localNotifications.filter(
        (notification) =>
          !notification.read
      );

      await Promise.all(
        unread.map((notification) =>
          axios.put(
            `${API}/notifications/read/${notification._id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
        )
      );

      setLocalNotifications(
        (current) =>
          current.map((notification) => ({
            ...notification,
            read: true,
          }))
      );

      setLastAction(
        "All notifications marked as read"
      );

      window.setTimeout(
        () => setLastAction(""),
        2200
      );
    } catch (error) {
      console.error(
        "FAILED TO MARK ALL NOTIFICATIONS AS READ:",
        error.response?.data ||
          error.message
      );

      setActionError(
        error.response?.data?.message ||
          "Some notifications could not be marked as read."
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleConnectionAction = async (
    notification,
    action
  ) => {
    const senderId =
      notification?.sender?._id ||
      notification?.sender;

    if (!senderId) {
      setActionError(
        "This connection request is missing its sender."
      );
      return;
    }

    try {
      setActionError("");

      setActionLoading(
        `${action}-${notification._id}`
      );

      const endpoint =
        action === "accept"
          ? `${API}/connections/accept/${senderId}`
          : `${API}/connections/reject/${senderId}`;

      await axios.post(
        endpoint,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await markAsRead(
        notification._id
      );

      setLocalNotifications(
        (current) =>
          current.map((item) =>
            item._id ===
            notification._id
              ? {
                  ...item,
                  read: true,
                  connectionHandled:
                    true,
                  connectionAction:
                    action,
                }
              : item
          )
      );

      setLastAction(
        action === "accept"
          ? "Connection accepted"
          : "Connection request declined"
      );

      window.setTimeout(
        () => setLastAction(""),
        2200
      );
    } catch (error) {
      console.error(
        `FAILED TO ${action.toUpperCase()} CONNECTION REQUEST:`,
        error.response?.data ||
          error.message
      );

      setActionError(
        error?.response?.data?.message ||
          `Failed to ${action} connection request.`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleProjectInviteAction =
    async (notification, action) => {
      const projectId =
        notification?.relatedProject?._id ||
        notification?.relatedProject;

      if (!projectId) {
        setActionError(
          "This project invitation is missing its project reference."
        );
        return;
      }

      try {
        setActionError("");

        setActionLoading(
          `${action}-${notification._id}`
        );

        const endpoint =
          action === "accept"
            ? `${API}/projects/accept-invite/${projectId}`
            : `${API}/projects/reject-invite/${projectId}`;

        await axios.put(
          endpoint,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        await markAsRead(
          notification._id
        );

        setLocalNotifications(
          (current) =>
            current.map((item) =>
              item._id ===
              notification._id
                ? {
                    ...item,
                    read: true,
                    projectInviteHandled:
                      true,
                    projectInviteAction:
                      action,
                  }
                : item
            )
        );

        if (action === "accept") {
          setLastAction(
            "Invitation accepted — opening workspace"
          );

          navigate(
            `/workspace/${projectId}`
          );
        } else {
          setLastAction(
            "Project invitation declined"
          );

          window.setTimeout(
            () => setLastAction(""),
            2200
          );
        }
      } catch (error) {
        console.error(
          `FAILED TO ${action.toUpperCase()} PROJECT INVITATION:`,
          error.response?.data ||
            error.message
        );

        setActionError(
          error?.response?.data?.message ||
            `Failed to ${action} project invitation.`
        );
      } finally {
        setActionLoading(null);
      }
    };

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification.read) {
      await markAsRead(
        notification._id
      );
    }

    /*
     * Preserve the current notification
     * contract. Navigation is only performed
     * when a concrete destination is already
     * available from the notification payload.
     */
    const type = notification.type;

    const senderId =
      notification?.sender?._id ||
      notification?.sender;

    const projectId =
      notification?.relatedProject?._id ||
      notification?.relatedProject;

    if (
      type === "project_invite" &&
      projectId
    ) {
      return;
    }

    if (
      type === "connection_request" &&
      senderId
    ) {
      navigate(`/developers/${senderId}`);
    }
  };

  const clearActionError = () => {
    setActionError("");
  };

  const renderTypeIcon = (type) => {
    const meta = getTypeMeta(type);
    const Icon = meta.icon;

    return (
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${meta.iconBg}`}
      >
        <Icon
          size={20}
          className={meta.iconClass}
        />
      </div>
    );
  };

  const renderActionState = (
    notification
  ) => {
    const isConnectionRequest =
      notification.type ===
      "connection_request";

    const isProjectInvite =
      notification.type ===
      "project_invite";

    const projectInviteHandled =
      notification.projectInviteHandled;

    const acceptLoading =
      actionLoading ===
      `accept-${notification._id}`;

    const rejectLoading =
      actionLoading ===
      `reject-${notification._id}`;

    const isActionLoading =
      acceptLoading ||
      rejectLoading;

    if (
      isConnectionRequest &&
      !notification.read &&
      !notification.connectionHandled
    ) {
      return (
        <div
          className="mt-5 flex flex-wrap gap-2.5"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() =>
              handleConnectionAction(
                notification,
                "accept"
              )
            }
            className="inline-flex min-w-[105px] items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-[#07111f] shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {acceptLoading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Check size={15} />
            )}

            {acceptLoading
              ? "Accepting..."
              : "Accept"}
          </button>

          <button
            type="button"
            disabled={isActionLoading}
            onClick={() =>
              handleConnectionAction(
                notification,
                "reject"
              )
            }
            className="inline-flex min-w-[105px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {rejectLoading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <X size={15} />
            )}

            {rejectLoading
              ? "Declining..."
              : "Decline"}
          </button>
        </div>
      );
    }

    if (
      isConnectionRequest &&
      notification.connectionHandled
    ) {
      return (
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/10 px-3.5 py-2 text-xs font-semibold text-emerald-300">
          <CheckCircle2 size={14} />
          {notification.connectionAction ===
          "accept"
            ? "Connection accepted"
            : "Request declined"}
        </div>
      );
    }

    if (
      isProjectInvite &&
      !projectInviteHandled &&
      !notification.read
    ) {
      return (
        <div
          className="mt-5 flex flex-wrap gap-2.5"
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            disabled={isActionLoading}
            onClick={() =>
              handleProjectInviteAction(
                notification,
                "accept"
              )
            }
            className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-bold text-[#07111f] shadow-lg shadow-cyan-400/10 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {acceptLoading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Check size={15} />
            )}

            {acceptLoading
              ? "Joining..."
              : "Accept & Join"}
          </button>

          <button
            type="button"
            disabled={isActionLoading}
            onClick={() =>
              handleProjectInviteAction(
                notification,
                "reject"
              )
            }
            className="inline-flex min-w-[110px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {rejectLoading ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <X size={15} />
            )}

            {rejectLoading
              ? "Declining..."
              : "Decline"}
          </button>
        </div>
      );
    }

    if (
      isProjectInvite &&
      projectInviteHandled
    ) {
      return (
        <div
          className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold ${
            notification.projectInviteAction ===
            "accept"
              ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/15 bg-red-500/10 text-red-300"
          }`}
        >
          {notification.projectInviteAction ===
          "accept" ? (
            <>
              <CheckCircle2 size={14} />
              You joined this project
            </>
          ) : (
            <>
              <X size={14} />
              Invitation declined
            </>
          )}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="animate-pulse">
          <div className="h-10 w-56 rounded-xl bg-white/10" />
          <div className="mt-4 h-5 w-96 max-w-full rounded-lg bg-white/5" />

          <div className="mt-10 rounded-[28px] border border-white/5 bg-white/[0.02] p-5">
            <div className="h-12 rounded-2xl bg-white/5" />
          </div>

          <div className="mt-5 space-y-3">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-[22px] border border-white/5 bg-[#111827] p-5"
                >
                  <div className="flex gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/5" />

                    <div className="flex-1">
                      <div className="h-4 w-3/4 rounded bg-white/10" />
                      <div className="mt-3 h-3 w-40 rounded bg-white/5" />
                      <div className="mt-4 h-8 w-28 rounded-xl bg-white/5" />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl pb-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#131c2d] via-[#101827] to-[#0B1220] p-6 shadow-2xl shadow-cyan-500/[0.03] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/10">
              <Bell size={25} />

              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#121a29] bg-cyan-400 px-1.5 text-[10px] font-black text-[#07111f]">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Notifications
                </h1>

                {unreadCount > 0 && (
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Stay on top of connections,
                projects, reactions, comments,
                and important activity across
                DevConnect.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                disabled={markingAllRead}
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingAllRead ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <CheckCheck size={14} />
                )}

                {markingAllRead
                  ? "Marking..."
                  : "Mark all as read"}
              </button>
            )}

            <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/10 px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
              <Sparkles size={13} />
              Activity center
            </div>
          </div>
        </div>
      </section>

      {/* Feedback */}
      {(actionError || lastAction) && (
        <div className="mt-4">
          {actionError ? (
            <button
              type="button"
              onClick={clearActionError}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border border-red-400/15 bg-red-500/10 px-4 py-3 text-left text-xs text-red-300"
            >
              <span>{actionError}</span>
              <X size={15} />
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-4 py-3 text-xs font-semibold text-emerald-300">
              <CheckCircle2 size={15} />
              {lastAction}
            </div>
          )}
        </div>
      )}

      {/* Filter bar */}
      <section className="mt-5 rounded-[24px] border border-white/10 bg-[#0F172A]/80 p-2 shadow-lg shadow-black/10">
        <div className="flex flex-wrap items-center gap-1">
          <div className="mr-1 flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
            <Filter size={13} />
            Filter
          </div>

          {FILTERS.map((filter) => {
            const active =
              activeFilter === filter.key;

            const count =
              filter.key === "unread"
                ? unreadCount
                : filter.key === "all"
                ? localNotifications.length
                : localNotifications.filter(
                    (notification) =>
                      getNotificationCategory(
                        notification
                      ) === filter.key
                  ).length;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    filter.key
                  )
                }
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "bg-cyan-400/10 text-cyan-300 shadow-sm"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                }`}
              >
                {filter.label}

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] ${
                    active
                      ? "bg-cyan-400/15 text-cyan-300"
                      : "bg-white/5 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div className="ml-auto hidden items-center gap-2 px-3 text-[10px] font-medium text-slate-600 sm:flex">
            <Inbox size={13} />
            {filteredNotifications.length} shown
          </div>
        </div>
      </section>

      {/* Empty */}
      {localNotifications.length === 0 ? (
        <div className="mt-5 flex min-h-[460px] flex-col items-center justify-center rounded-[28px] border border-white/10 bg-gradient-to-b from-[#111827] to-[#0F172A] px-8 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/15 bg-cyan-400/10">
            <Bell
              size={34}
              className="text-cyan-300"
            />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-white">
            You're all caught up
          </h2>

          <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
            New connection requests,
            project activity, reactions, and
            other important events will appear
            here.
          </p>
        </div>
      ) : filteredNotifications.length ===
        0 ? (
        <div className="mt-5 flex min-h-[400px] flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[#111827] px-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
            <Filter
              size={26}
              className="text-slate-500"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-white">
            Nothing in this view
          </h2>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
            There are no notifications matching
            the current filter.
          </p>

          <button
            type="button"
            onClick={() =>
              setActiveFilter("all")
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Show all notifications
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="mt-7 space-y-8">
          {groupedNotifications.map(
            (group) => (
              <section key={group.label}>
                <div className="mb-3 flex items-center gap-3 px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                    {group.label}
                  </span>

                  <div className="h-px flex-1 bg-white/5" />

                  <span className="text-[10px] font-semibold text-slate-700">
                    {group.items.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {group.items.map(
                    (notification) => {
                      const meta =
                        getTypeMeta(
                          notification.type
                        );

                      const isUnread =
                        !notification.read;

                      const senderName =
                        notification?.sender
                          ?.name;

                      const isActionLoading =
                        actionLoading?.endsWith(
                          `-${notification._id}`
                        );

                      return (
                        <article
                          key={
                            notification._id
                          }
                          onClick={() =>
                            handleNotificationClick(
                              notification
                            )
                          }
                          className={`group relative overflow-hidden rounded-[22px] border p-4 transition-all duration-200 sm:p-5 ${
                            isUnread
                              ? "border-cyan-400/15 bg-gradient-to-r from-cyan-400/[0.055] via-[#111827] to-[#111827]"
                              : "border-white/5 bg-[#111827]/85"
                          } ${
                            notification.type ===
                              "connection_request" ||
                            notification.type ===
                              "project_invite"
                              ? "cursor-pointer"
                              : "cursor-default"
                          } hover:border-white/10 hover:shadow-xl hover:shadow-black/15`}
                        >
                          {isUnread && (
                            <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,.6)]" />
                          )}

                          <div className="flex items-start gap-3.5 sm:gap-4">
                            {renderTypeIcon(
                              notification.type
                            )}

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                      isUnread
                                        ? "border-cyan-400/15 bg-cyan-400/10 text-cyan-300"
                                        : "border-white/5 bg-white/[0.03] text-slate-600"
                                    }`}
                                  >
                                    {meta.label}
                                  </span>

                                  {isUnread && (
                                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan-300">
                                      <CircleDot
                                        size={10}
                                      />
                                      New
                                    </span>
                                  )}
                                </div>

                                <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-slate-600">
                                  <Clock3
                                    size={12}
                                  />
                                  {formatRelativeTime(
                                    notification.createdAt
                                  )}
                                </div>
                              </div>

                              <p
                                className={`mt-2.5 text-sm leading-6 ${
                                  isUnread
                                    ? "font-medium text-slate-100"
                                    : "text-slate-400"
                                }`}
                              >
                                {notification.message}
                              </p>

                              {senderName && (
                                <div className="mt-2 text-[10px] text-slate-600">
                                  From{" "}
                                  <span className="font-semibold text-slate-500">
                                    {senderName}
                                  </span>
                                </div>
                              )}

                              <div className="mt-3 flex flex-wrap items-center gap-3">
                                <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                  {notification.read ? (
                                    <>
                                      <Check size={12} />
                                      Read
                                    </>
                                  ) : (
                                    <>
                                      <CircleDot
                                        size={12}
                                        className="text-cyan-400"
                                      />
                                      Unread
                                    </>
                                  )}
                                </span>

                                {isActionLoading && (
                                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-cyan-300">
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                    Updating...
                                  </span>
                                )}
                              </div>

                              {renderActionState(
                                notification
                              )}
                            </div>

                            {isUnread && (
                              <span
                                aria-label="Unread notification"
                                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.75)]"
                              />
                            )}
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              </section>
            )
          )}
        </div>
      )}

      {/* Footer */}
      {localNotifications.length > 0 && (
        <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-white/5 px-1 pt-5 text-[10px] text-slate-700 sm:flex-row">
          <div className="flex items-center gap-2">
            <RefreshCw size={12} />
            Notification state is synchronized
            through your existing notification
            service.
          </div>

          <div className="flex items-center gap-2">
            <Users size={12} />
            {localNotifications.length} total
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
