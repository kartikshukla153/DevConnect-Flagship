import { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";

import { getSocket } from "../../socket/socket";

function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/notifications/unread-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const socket = getSocket();

    if (!socket) return;

    socket.on("newNotification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  return (
    <div className="relative">

      <Bell
        size={24}
        className="hover:text-cyan-400 transition"
      />

      {unreadCount > 0 && (
        <div
          className="
          absolute
          -top-2
          -right-2
          w-5
          h-5
          rounded-full
          bg-red-500
          text-[11px]
          font-bold
          flex
          items-center
          justify-center
        "
        >
          {unreadCount}
        </div>
      )}

    </div>
  );
}

export default NotificationBell;