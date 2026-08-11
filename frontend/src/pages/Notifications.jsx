import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell,
  UserPlus,
  Heart,
  MessageCircle,
  CheckCircle2,
  Clock3,
  Check,
  X,
  Loader2,
} from "lucide-react";

import useNotifications from "../hooks/useNotifications";

const API = "http://localhost:5000/api";

function Notifications() {
  const { notifications, loading } = useNotifications();

  const [localNotifications, setLocalNotifications] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setLocalNotifications(notifications || []);
  }, [notifications]);

  const getIcon = (type) => {
    switch (type) {
      case "connection_request":
        return (
          <UserPlus
            size={20}
            className="text-cyan-400"
          />
        );

      case "post_like":
        return (
          <Heart
            size={20}
            className="text-pink-400"
          />
        );

      case "post_comment":
        return (
          <MessageCircle
            size={20}
            className="text-green-400"
          />
        );

      case "connection_accepted":
        return (
          <CheckCircle2
            size={20}
            className="text-green-400"
          />
        );

      default:
        return (
          <Bell
            size={20}
            className="text-cyan-400"
          />
        );
    }
  };

  const markAsRead = async (notificationId) => {
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
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleConnectionAction = async (
    notification,
    action
  ) => {
    const senderId =
      notification?.sender?._id || notification?.sender;

    if (!senderId) {
      console.error(
        "Sender ID missing from notification"
      );
      return;
    }

    try {
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

      await markAsRead(notification._id);

      setLocalNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                read: true,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        `Failed to ${action} connection request:`,
        error
      );

      const message =
        error?.response?.data?.message ||
        `Failed to ${action} connection request`;

      alert(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleNotificationClick = async (
    notification
  ) => {
    if (notification.read) {
      return;
    }

    await markAsRead(notification._id);

    setLocalNotifications((current) =>
      current.map((item) =>
        item._id === notification._id
          ? {
              ...item,
              read: true,
            }
          : item
      )
    );
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-xl text-gray-400">
          Loading Notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}

      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Notifications
        </h1>

        <p className="mt-3 text-lg text-gray-400">
          Connection requests, comments, likes and activity
          across DevConnect.
        </p>
      </div>

      {/* Empty State */}

      {localNotifications.length === 0 ? (
        <div className="rounded-2xl border border-[#263243] bg-[#111827] p-20 text-center">
          <Bell
            size={60}
            className="mx-auto mb-6 text-gray-500"
          />

          <h2 className="text-2xl font-semibold">
            You're all caught up 🎉
          </h2>

          <p className="mt-3 text-gray-400">
            New notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {localNotifications.map((notification) => {
            const isConnectionRequest =
              notification.type ===
              "connection_request";

            const acceptLoading =
              actionLoading ===
              `accept-${notification._id}`;

            const rejectLoading =
              actionLoading ===
              `reject-${notification._id}`;

            const isActionLoading =
              acceptLoading || rejectLoading;

            return (
              <div
                key={notification._id}
                onClick={() =>
                  handleNotificationClick(notification)
                }
                className={`group rounded-2xl border bg-[#111827] px-6 py-5 transition-all duration-300 ${
                  notification.read
                    ? "border-[#263243]"
                    : "border-cyan-400/30"
                } hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_15px_40px_rgba(0,0,0,.35)]`}
              >
                <div className="flex items-start gap-5">
                  {/* Icon */}

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0F172A]">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}

                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-7 text-gray-100">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock3 size={15} />

                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </div>

                      {!notification.read && (
                        <div className="flex items-center gap-2 text-cyan-400">
                          <CheckCircle2 size={15} />

                          Unread
                        </div>
                      )}

                      {notification.read && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Check size={15} />

                          Read
                        </div>
                      )}
                    </div>

                    {/* Connection Request Actions */}

                    {isConnectionRequest &&
                      !notification.read && (
                        <div
                          className="mt-5 flex flex-wrap gap-3"
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
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#07111f] transition-all duration-200 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {acceptLoading ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                                Accepting...
                              </>
                            ) : (
                              <>
                                <Check size={16} />
                                Accept
                              </>
                            )}
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
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#374151] bg-[#0F172A] px-5 py-2.5 text-sm font-semibold text-gray-200 transition-all duration-200 hover:border-red-400/50 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {rejectLoading ? (
                              <>
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                                Declining...
                              </>
                            ) : (
                              <>
                                <X size={16} />
                                Decline
                              </>
                            )}
                          </button>
                        </div>
                      )}
                  </div>

                  {/* Unread Indicator */}

                  {!notification.read && (
                    <div className="mt-2 h-3 w-3 shrink-0 animate-pulse rounded-full bg-cyan-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;