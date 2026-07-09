import { useEffect, useState } from "react";
import axios from "axios";
import { getSocket } from "../socket/socket";

const API = "http://localhost:5000/api/notifications";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const [notificationRes, unreadRes] = await Promise.all([
        axios.get(API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${API}/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      setNotifications(
        notificationRes.data.notifications || []
      );

      setUnreadCount(
        unreadRes.data.unreadCount || 0
      );
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();

    if (!socket) return;

    socket.on("newNotification", (notification) => {
      setNotifications((prev) => [
        notification,
        ...prev,
      ]);

      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications: fetchNotifications,
  };
}