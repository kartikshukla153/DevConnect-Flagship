import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  MapPin,
  ExternalLink,
  Sparkles,
  Globe,
  Loader2,
  UserRound,
  CheckCircle2,
} from "lucide-react";
import StatusButton from "./StatusButton";
import OnlineIndicator from "../OnlineIndicator";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

function DeveloperCard({ profile, onlineUsers = [] }) {
  const [status, setStatus] = useState("none");
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userId = profile?.user?._id;

  const isOnline = userId
    ? onlineUsers.some(
        (onlineId) => String(onlineId) === String(userId)
      )
    : false;

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const initials = useMemo(() => {
    const name =
      profile?.user?.name ||
      profile?.username ||
      "Developer";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [profile]);

  const visibleSkills = Array.isArray(profile?.skills)
    ? profile.skills.slice(0, 5)
    : [];

  const remainingSkills = Math.max(
    (profile?.skills?.length || 0) - visibleSkills.length,
    0
  );

  const experienceCount = profile?.experience?.length || 0;

  const github =
    profile?.socialLinks?.github ||
    profile?.user?.github ||
    "";

  const portfolio =
    profile?.socialLinks?.portfolio || "";

  const linkedin =
    profile?.socialLinks?.linkedin ||
    profile?.user?.linkedin ||
    "";

  const fetchStatus = async () => {
    if (!userId || !token) return;

    try {
      const res = await axios.get(
        `${API}/connections/status/${userId}`,
        authConfig
      );

      setStatus(res.data?.status || "none");
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

  const removeConnection = async () => {
    const confirmed = window.confirm(
      `Remove ${
        profile?.user?.name || "this developer"
      } from your connections?`
    );

    if (!confirmed) return;

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
    <article className="group relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0F1726] shadow-[0_18px_60px_rgba(0,0,0,.12)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_24px_70px_rgba(0,0,0,.22)]">

      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition group-hover:opacity-100" />

      {/* Header */}
      <div className="relative h-24 overflow-hidden bg-[#101B2C]">
        <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-cyan-400/[0.08] blur-2xl" />

        <div className="absolute bottom-4 left-5 flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#08111F]/80 px-2.5 py-1.5 backdrop-blur">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isOnline
                ? "bg-emerald-400"
                : "bg-slate-600"
            }`}
          />

          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="px-5 pb-5">

        {/* Identity */}
        <div className="-mt-10 flex items-end justify-between">

          <div className="relative">
            {profile?.user?.profilePicture ? (
              <img
                src={profile.user.profilePicture}
                alt={
                  profile?.user?.name ||
                  "Developer"
                }
                className="h-[76px] w-[76px] rounded-[22px] border-4 border-[#0F1726] object-cover"
              />
            ) : (
              <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] border-4 border-[#0F1726] bg-cyan-400 text-xl font-bold text-[#07111f]">
                {initials}
              </div>
            )}

            <div className="absolute bottom-1 right-1">
              <OnlineIndicator online={isOnline} />
            </div>
          </div>

          <div className="mb-1 flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-[#0A1220] px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-cyan-300">
            <Sparkles size={12} />
            Developer
          </div>
        </div>

        {/* Name */}
        <div className="mt-5">
          <h2 className="truncate text-xl font-bold tracking-[-0.02em] text-white">
            {profile?.user?.name ||
              profile?.username ||
              "Developer"}
          </h2>

          {profile?.username && (
            <p className="mt-1 truncate text-xs text-cyan-300/80">
              @{profile.username}
            </p>
          )}

          {profile?.headline ? (
            <p className="mt-4 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-300">
              {profile.headline}
            </p>
          ) : (
            <p className="mt-4 min-h-[40px] text-sm italic leading-5 text-slate-600">
              No headline added yet.
            </p>
          )}
        </div>

        {/* Location / availability */}
        <div className="mt-5 flex flex-wrap gap-2">

          {profile?.location && (
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-xs text-slate-400">
              <MapPin
                size={13}
                className="shrink-0 text-slate-500"
              />

              <span className="truncate">
                {profile.location}
              </span>
            </span>
          )}

          {profile?.availability && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1.5 text-xs text-emerald-300">
              <CheckCircle2 size={13} />

              {profile.availability}
            </span>
          )}
        </div>

        {/* Skills */}
        <div className="mt-5 min-h-[60px]">
          {visibleSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {visibleSkills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05] px-2.5 py-1.5 text-[11px] font-medium text-cyan-200"
                  >
                    {skill}
                  </span>
                )
              )}

              {remainingSkills > 0 && (
                <span className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1.5 text-[11px] font-medium text-slate-500">
                  +{remainingSkills}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-600">
              No skills listed yet.
            </p>
          )}
        </div>

        {/* Engineering footprint */}
        <div className="mt-5 grid grid-cols-2 gap-2">

          <div className="rounded-xl border border-white/[0.06] bg-[#0A1220] px-3 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-cyan-400/10 bg-cyan-400/[0.05] text-[10px] font-bold text-cyan-300">
                #
              </span>

              <span className="text-[10px] uppercase tracking-[0.08em]">
                Stack
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-white">
              {profile?.skills?.length || 0} skills
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0A1220] px-3 py-3">
            <div className="flex items-center gap-2 text-slate-500">
              <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.025] text-[10px] font-bold text-slate-400">
                ↗
              </span>

              <span className="text-[10px] uppercase tracking-[0.08em]">
                Experience
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-white">
              {experienceCount}{" "}
              {experienceCount === 1
                ? "role"
                : "roles"}
            </p>
          </div>

        </div>

        {/* External links */}
        {(github || linkedin || portfolio) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">

            {github && (
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-white/[0.12] hover:text-white"
              >
                <Globe size={13} />
                GitHub
              </a>
            )}

            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noreferrer"
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-white/[0.12] hover:text-white"
              >
                <ExternalLink size={13} />
                LinkedIn
              </a>
            )}

            {portfolio && (
              <a
                href={portfolio}
                target="_blank"
                rel="noreferrer"
                onClick={(event) =>
                  event.stopPropagation()
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs text-slate-500 transition hover:border-white/[0.12] hover:text-white"
              >
                <ExternalLink size={13} />
                Portfolio
              </a>
            )}

          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-2">

          <Link
            to={`/developers/${userId}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.06] hover:text-cyan-200"
          >
            View profile

            <ExternalLink size={16} />
          </Link>

          <div className="min-w-0 flex-1">
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

        {actionLoading && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-600">
            <Loader2
              size={12}
              className="animate-spin"
            />

            Updating connection...
          </div>
        )}

      </div>
    </article>
  );
}

export default DeveloperCard;