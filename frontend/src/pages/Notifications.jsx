import useNotifications from "../hooks/useNotifications";

function Notifications() {
  const {
    notifications,
    loading,
  } = useNotifications();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-white p-8">

      <h1 className="text-4xl font-bold mb-8">
        Notifications
      </h1>

      <div className="space-y-4">

        {notifications.map((notification) => (
          <div
            key={notification._id}
            className="bg-white/5 rounded-xl p-5 border border-white/10"
          >
            <h2>
              {notification.message}
            </h2>

            <p className="text-sm text-white/40 mt-2">
              {new Date(
                notification.createdAt
              ).toLocaleString()}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Notifications;