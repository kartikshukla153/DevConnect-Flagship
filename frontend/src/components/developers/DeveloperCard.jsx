import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import StatusButton from "./StatusButton";
import OnlineIndicator from "../OnlineIndicator";

function DeveloperCard({ profile, onlineUsers }) {
  const [status, setStatus] = useState("none");

  const token = localStorage.getItem("token");

  const isOnline = onlineUsers.includes(profile.user._id);
  console.log("-------------");
console.log("CARD USER :", profile.user.name);
console.log("CARD ID   :", profile.user._id);
console.log("ONLINE    :", onlineUsers);
console.log("ISONLINE  :", onlineUsers.includes(profile.user._id));


  const fetchStatus = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/connections/status/${profile.user._id}`,
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

  useEffect(() => {
    fetchStatus();
  }, []);

  const sendRequest = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/connections/request/${profile.user._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStatus("pending");
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-cyan-500/50 transition">

      <div className="flex items-center gap-3 mb-2">
        <OnlineIndicator online={isOnline} />

        <h2 className="text-2xl font-bold">
          {profile.user?.name}
        </h2>
      </div>

      <p className="text-cyan-400 mb-3">
        @{profile.username}
      </p>

      <p className="text-white/70 mb-4">
        {profile.headline}
      </p>

      {profile.location && (
        <p className="text-white/50 mb-4">
          📍 {profile.location}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {profile.skills?.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-sm"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          to={`/developers/${profile.user._id}`}
          className="flex-1 text-center py-2 rounded-lg bg-cyan-500 text-black font-semibold"
        >
          View Profile
        </Link>

        <StatusButton
          status={status}
          sendRequest={sendRequest}
        />
      </div>

    </div>
  );
}

export default DeveloperCard;