function NotificationDropdown({
  notifications,
  loading,
}) {
  return (
    <div className="absolute right-0 mt-3 w-96 bg-[#111827] rounded-xl border border-white/10 shadow-2xl max-h-[500px] overflow-y-auto">

      <div className="p-4 border-b border-white/10 font-semibold">
        Notifications
      </div>

      {loading ? (
        <div className="p-6">
          Loading...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-6 text-white/50">
          No Notifications
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className={`p-4 border-b border-white/10 ${
              !notification.read
                ? "bg-cyan-500/10"
                : ""
            }`}
          >
            <p>
              {notification.message}
            </p>

            <p className="text-xs text-white/40 mt-1">
              {new Date(
                notification.createdAt
              ).toLocaleString()}
            </p>
          </div>
        ))
      )}

    </div>
  );
}

export default NotificationDropdown;