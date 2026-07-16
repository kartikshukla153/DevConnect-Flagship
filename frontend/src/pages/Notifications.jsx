import {
  Bell,
  UserPlus,
  Heart,
  MessageCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import useNotifications from "../hooks/useNotifications";

function Notifications() {
  const { notifications, loading } = useNotifications();

  const getIcon = (type) => {
    switch (type) {
      case "connection_request":
        return (
          <UserPlus
            size={20}
            className="text-cyan-400"
          />
        );

      case "like":
        return (
          <Heart
            size={20}
            className="text-pink-400"
          />
        );

      case "comment":
        return (
          <MessageCircle
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
          Connection requests, comments, likes and activity across DevConnect.
        </p>

      </div>

      {/* Empty State */}

      {notifications.length === 0 ? (

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

          {notifications.map((notification) => (

            <div
              key={notification._id}
              className="group flex items-start gap-5 rounded-2xl border border-[#263243] bg-[#111827] px-6 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-[0_15px_40px_rgba(0,0,0,.35)]"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F172A]">
                {getIcon(notification.type)}
              </div>

              <div className="flex-1">

                <p className="text-[15px] leading-7">
                  {notification.message}
                </p>

                <div className="mt-3 flex items-center gap-6 text-sm text-gray-400">

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

                </div>

              </div>

              {!notification.read && (
                <div className="mt-2 h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
              )}

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Notifications;