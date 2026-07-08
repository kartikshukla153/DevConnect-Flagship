import { useEffect, useState } from "react";
import axios from "axios";

function StatusButton({ userId }) {
  const [status, setStatus] = useState("loading");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/connections/status/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus(res.data.status);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  const sendRequest = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/connections/request/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus("pending");
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  };

  if (status === "loading") {
    return (
      <button className="px-4 py-2 bg-gray-600 rounded-lg">
        ...
      </button>
    );
  }

  if (status === "self") {
    return (
      <button className="px-4 py-2 bg-gray-600 rounded-lg">
        You
      </button>
    );
  }

  if (status === "none") {
    return (
      <button
        onClick={sendRequest}
        className="px-4 py-2 bg-cyan-500 rounded-lg text-black font-semibold"
      >
        Connect
      </button>
    );
  }

  if (status === "pending") {
    return (
      <button className="px-4 py-2 bg-yellow-500 rounded-lg text-black">
        Pending
      </button>
    );
  }

  if (status === "connected") {
    return (
      <button className="px-4 py-2 bg-green-600 rounded-lg">
        Connected
      </button>
    );
  }

  if (status === "received") {
    return (
      <button className="px-4 py-2 bg-blue-600 rounded-lg">
        Accept
      </button>
    );
  }

  return null;
}

export default StatusButton;