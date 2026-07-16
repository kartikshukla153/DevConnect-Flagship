import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  MapPin,
  UserPlus,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import StatusButton from "./StatusButton";
import OnlineIndicator from "../OnlineIndicator";

function DeveloperCard({ profile, onlineUsers }) {
  const [status, setStatus] = useState("none");

  const token = localStorage.getItem("token");

  const isOnline = onlineUsers.includes(profile.user._id);

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
      console.log(err);
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
      alert(err.response?.data?.message);
    }
  };

  return (
    <div className="group rounded-3xl border border-[#263243] bg-[#111827] overflow-hidden transition duration-300 hover:border-cyan-400 hover:-translate-y-1">

      {/* Banner */}

      <div className="h-24 bg-gradient-to-r from-cyan-500/30 via-cyan-400/10 to-transparent" />

      {/* Avatar */}

      <div className="px-6">

        <div className="-mt-10 flex justify-between items-start">

          <div className="relative">

            <div className="w-20 h-20 rounded-full bg-cyan-400 flex items-center justify-center text-black text-3xl font-bold border-4 border-[#111827]">
              {profile.user?.name?.charAt(0)}
            </div>

            <div className="absolute bottom-1 right-1">
              <OnlineIndicator online={isOnline} />
            </div>

          </div>

          <div className="rounded-xl bg-[#0B1220] border border-[#374151] px-3 py-2 text-xs text-cyan-300 flex items-center gap-2">
            <Sparkles size={14} />
            Developer
          </div>

        </div>

        <div className="mt-5">

          <h2 className="text-2xl font-bold">
            {profile.user?.name}
          </h2>

          <p className="text-cyan-400 mt-1">
            @{profile.username}
          </p>

          {profile.headline && (
            <p className="text-gray-300 mt-4 leading-7">
              {profile.headline}
            </p>
          )}

          {profile.location && (
            <div className="flex items-center gap-2 text-gray-400 mt-5">
              <MapPin size={16} />
              {profile.location}
            </div>
          )}

        </div>

        {/* Skills */}

        <div className="flex flex-wrap gap-2 mt-6">

          {profile.skills?.slice(0,6).map((skill)=>(
            <span
              key={skill}
              className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300"
            >
              {skill}
            </span>
          ))}

        </div>

        {/* Stats */}

        <div className="grid grid-cols-3 gap-3 mt-8">

          <div className="rounded-2xl bg-[#0B1220] p-4 border border-[#263243]">

            <div className="text-2xl font-bold">
              {profile.skills?.length || 0}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              Skills
            </div>

          </div>

          <div className="rounded-2xl bg-[#0B1220] p-4 border border-[#263243]">

            <div className="text-2xl font-bold">
              {profile.experience?.length || 0}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              Experience
            </div>

          </div>

          <div className="rounded-2xl bg-[#0B1220] p-4 border border-[#263243]">

            <div className="text-2xl font-bold">
              {isOnline ? "●" : "○"}
            </div>

            <div className="text-xs text-gray-500 mt-1">
              Status
            </div>

          </div>

        </div>

        {/* Buttons */}

        <div className="flex gap-3 mt-8 mb-6">

          <Link
            to={`/developers/${profile.user._id}`}
            className="flex-1 rounded-2xl bg-cyan-400 hover:bg-cyan-300 transition text-center py-3 text-black font-semibold flex items-center justify-center gap-2"
          >
            <ExternalLink size={18} />
            View Profile
          </Link>

          <div className="flex-1">
            <StatusButton
              status={status}
              sendRequest={sendRequest}
            />
          </div>

        </div>

      </div>

    </div>
  );
}

export default DeveloperCard;