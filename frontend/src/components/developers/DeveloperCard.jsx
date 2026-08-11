import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  MapPin,
  ExternalLink,
  Sparkles,
} from "lucide-react";

import StatusButton from "./StatusButton";
import OnlineIndicator from "../OnlineIndicator";

const API = "http://localhost:5000/api";

function DeveloperCard({
  profile,
  onlineUsers = [],
}) {
  const [status, setStatus] = useState("none");
  const [actionLoading, setActionLoading] =
    useState(false);

  const token = localStorage.getItem("token");

  const userId = profile?.user?._id;

  const isOnline = userId
    ? onlineUsers.includes(userId)
    : false;

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /*
   * GET CURRENT CONNECTION STATUS
   */
  const fetchStatus = async () => {
    if (!userId || !token) {
      return;
    }

    try {
      const res = await axios.get(
        `${API}/connections/status/${userId}`,
        authConfig
      );

      setStatus(res.data.status || "none");
    } catch (error) {
      console.error(
        "Failed to fetch connection status:",
        error
      );
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [userId]);

  /*
   * SEND CONNECTION REQUEST
   */
  const sendRequest = async () => {
    try {
      setActionLoading(true);

      await axios.post(
        `${API}/connections/request/${userId}`,
        {},
        authConfig
      );

      setStatus("pending");
    } catch (error) {
      console.error(
        "Failed to send connection request:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to send connection request"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * CANCEL SENT REQUEST
   */
  const cancelRequest = async () => {
    try {
      setActionLoading(true);

      await axios.delete(
        `${API}/connections/cancel/${userId}`,
        authConfig
      );

      setStatus("none");
    } catch (error) {
      console.error(
        "Failed to cancel connection request:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to cancel connection request"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * ACCEPT RECEIVED REQUEST
   */
  const acceptRequest = async () => {
    try {
      setActionLoading(true);

      await axios.post(
        `${API}/connections/accept/${userId}`,
        {},
        authConfig
      );

      setStatus("connected");
    } catch (error) {
      console.error(
        "Failed to accept connection request:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to accept connection request"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * REJECT RECEIVED REQUEST
   */
  const rejectRequest = async () => {
    try {
      setActionLoading(true);

      await axios.post(
        `${API}/connections/reject/${userId}`,
        {},
        authConfig
      );

      setStatus("none");
    } catch (error) {
      console.error(
        "Failed to reject connection request:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to reject connection request"
      );
    } finally {
      setActionLoading(false);
    }
  };

  /*
   * REMOVE EXISTING CONNECTION
   */
  const removeConnection = async () => {
    const confirmed = window.confirm(
      `Remove ${profile?.user?.name || "this developer"} from your connections?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      await axios.delete(
        `${API}/connections/remove/${userId}`,
        authConfig
      );

      setStatus("none");
    } catch (error) {
      console.error(
        "Failed to remove connection:",
        error
      );

      alert(
        error?.response?.data?.message ||
          "Failed to remove connection"
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-[#263243] bg-[#111827] transition duration-300 hover:-translate-y-1 hover:border-cyan-400">
      {/* Banner */}

      <div className="h-24 bg-gradient-to-r from-cyan-500/30 via-cyan-400/10 to-transparent" />

      {/* Main Content */}

      <div className="px-6">
        {/* Avatar */}

        <div className="-mt-10 flex items-start justify-between">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#111827] bg-cyan-400 text-3xl font-bold text-black">
              {profile?.user?.name?.charAt(0)?.toUpperCase() ||
                "D"}
            </div>

            <div className="absolute bottom-1 right-1">
              <OnlineIndicator online={isOnline} />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-[#374151] bg-[#0B1220] px-3 py-2 text-xs text-cyan-300">
            <Sparkles size={14} />
            Developer
          </div>
        </div>

        {/* Identity */}

        <div className="mt-5">
          <h2 className="text-2xl font-bold">
            {profile?.user?.name}
          </h2>

          <p className="mt-1 text-cyan-400">
            @{profile?.username}
          </p>

          {profile?.headline && (
            <p className="mt-4 leading-7 text-gray-300">
              {profile.headline}
            </p>
          )}

          {profile?.location && (
            <div className="mt-5 flex items-center gap-2 text-gray-400">
              <MapPin size={16} />
              {profile.location}
            </div>
          )}
        </div>

        {/* Skills */}

        <div className="mt-6 flex flex-wrap gap-2">
          {profile?.skills
            ?.slice(0, 6)
            .map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300"
              >
                {skill}
              </span>
            ))}
        </div>

        {/* Stats */}

        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-[#263243] bg-[#0B1220] p-4">
            <div className="text-2xl font-bold">
              {profile?.skills?.length || 0}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Skills
            </div>
          </div>

          <div className="rounded-2xl border border-[#263243] bg-[#0B1220] p-4">
            <div className="text-2xl font-bold">
              {profile?.experience?.length || 0}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Experience
            </div>
          </div>

          <div className="rounded-2xl border border-[#263243] bg-[#0B1220] p-4">
            <div className="text-2xl font-bold">
              {isOnline ? "●" : "○"}
            </div>

            <div className="mt-1 text-xs text-gray-500">
              Status
            </div>
          </div>
        </div>

        {/* Actions */}

        <div className="mb-6 mt-8 flex gap-3">
          <Link
            to={`/developers/${userId}`}
            className="flex-1 rounded-2xl bg-cyan-400 py-3 text-center font-semibold text-black transition hover:bg-cyan-300"
          >
            <span className="flex items-center justify-center gap-2">
              <ExternalLink size={18} />
              View Profile
            </span>
          </Link>

          <div className="flex-1">
            <StatusButton
              status={status}
              sendRequest={sendRequest}
              cancelRequest={cancelRequest}
              acceptRequest={acceptRequest}
              rejectRequest={rejectRequest}
              removeConnection={removeConnection}
              actionLoading={actionLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeveloperCard;