import { useEffect, useState } from "react";
import axios from "axios";
import { getSocket } from "../socket/socket";

const API = "http://localhost:5000/api/notifications";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(res.data.notifications || []);
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
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  return {
    notifications,
    loading,
    refreshNotifications: fetchNotifications,
  };
}