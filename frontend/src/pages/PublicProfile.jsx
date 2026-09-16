import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  Globe,
  Loader2,
  MapPin,
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";

import StatusButton from "../components/StatusButton";
import OnlineIndicator from "../components/OnlineIndicator";
import useOnlineUsers from "../hooks/useOnlineUsers";
import formatLastSeen from "../utils/formatLastSeen";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

function PublicProfile() {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const onlineUsers = useOnlineUsers();

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setError("Invalid profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/profile/${userId}`);

      setProfile(response.data?.profile || null);
    } catch (err) {
      console.error("PUBLIC PROFILE FETCH ERROR:", err);

      setProfile(null);
      setError(
        err?.response?.data?.message ||
          "Unable to load this developer profile."
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const profileUserId = profile?.user?._id;

  const isOnline = useMemo(() => {
    if (!profileUserId || !Array.isArray(onlineUsers)) {
      return false;
    }

    return onlineUsers.some(
      (onlineId) =>
        String(onlineId) === String(profileUserId)
    );
  }, [onlineUsers, profileUserId]);

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

  const experience = Array.isArray(profile?.experience)
    ? profile.experience
    : [];

  const skills = Array.isArray(profile?.skills)
    ? profile.skills
    : [];

  const github =
    profile?.socialLinks?.github ||
    profile?.user?.github ||
    "";

  const linkedin =
    profile?.socialLinks?.linkedin ||
    profile?.user?.linkedin ||
    "";

  const portfolio =
    profile?.socialLinks?.portfolio ||
    "";

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1100px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06]">
            <Loader2
              size={22}
              className="animate-spin text-cyan-300"
            />
          </div>

          <div>
            <p className="font-medium text-white">
              Loading profile
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Fetching developer information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-[1100px] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
            <UserRound
              size={28}
              className="text-slate-500"
            />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-white">
            Profile not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ||
              "This developer profile may no longer be available."}
          </p>

          <Link
            to="/developers"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-[#07111f] transition hover:bg-cyan-300"
          >
            <ArrowLeft size={16} />
            Back to Developers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1150px]">
      {/* Back */}
      <Link
        to="/developers"
        className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2 text-sm text-slate-400 transition hover:border-white/[0.12] hover:text-white"
      >
        <ArrowLeft size={15} />
        Developers
      </Link>

      {/* Profile Hero */}
      <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0F1726] shadow-[0_20px_70px_rgba(0,0,0,.16)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        <div className="relative h-36 overflow-hidden bg-[#101B2C]">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/[0.08] blur-3xl" />

          <div className="absolute -left-16 top-12 h-32 w-32 rounded-full bg-cyan-400/[0.04] blur-3xl" />

          <div className="absolute bottom-5 left-6 flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#08111F]/80 px-3 py-1.5 backdrop-blur-xl">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOnline
                  ? "bg-emerald-400"
                  : "bg-slate-600"
              }`}
            />

            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              {isOnline ? "Online now" : "Offline"}
            </span>
          </div>
        </div>

        <div className="relative px-6 pb-7 lg:px-8">
          {/* Identity */}
          <div className="-mt-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative shrink-0">
                {profile.user?.profilePicture ? (
                  <img
                    src={profile.user.profilePicture}
                    alt={
                      profile.user?.name ||
                      "Developer"
                    }
                    className="h-24 w-24 rounded-[26px] border-4 border-[#0F1726] object-cover shadow-xl"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-[26px] border-4 border-[#0F1726] bg-cyan-400 text-2xl font-bold text-[#07111f] shadow-xl">
                    {initials}
                  </div>
                )}

                <div className="absolute bottom-1 right-1">
                  <OnlineIndicator online={isOnline} />
                </div>
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-[-0.03em] text-white">
                    {profile.user?.name ||
                      profile.username ||
                      "Developer"}
                  </h1>

                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-cyan-300">
                    <Sparkles size={11} />
                    Developer
                  </span>
                </div>

                {profile.username && (
                  <p className="mt-1 text-sm text-cyan-300/80">
                    @{profile.username}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOnline
                        ? "bg-emerald-400"
                        : "bg-slate-600"
                    }`}
                  />

                  <span>
                    {isOnline
                      ? "Online"
                      : profile.user?.lastSeen
                      ? formatLastSeen(
                          profile.user.lastSeen
                        )
                      : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-auto">
              <StatusButton userId={userId} />
            </div>
          </div>

          {/* Headline */}
          {profile.headline ? (
            <div className="mt-7 max-w-4xl">
              <h2 className="text-xl font-semibold leading-8 text-slate-100">
                {profile.headline}
              </h2>
            </div>
          ) : (
            <p className="mt-7 text-sm italic text-slate-600">
              No headline added yet.
            </p>
          )}

          {/* Meta */}
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.location && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-slate-400">
                <MapPin
                  size={14}
                  className="text-slate-500"
                />
                {profile.location}
              </span>
            )}

            {profile.availability && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-2 text-xs text-emerald-300">
                <CheckCircle2 size={14} />
                {profile.availability}
              </span>
            )}
          </div>

          {/* External Links */}
          {(github || linkedin || portfolio) && (
            <div className="mt-5 flex flex-wrap gap-2">
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:text-white"
                >
                  <GitBranch size={15} />
                  GitHub
                  <ExternalLink size={12} />
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:text-white"
                >
                  <ExternalLink size={15} />
                  LinkedIn
                  <ExternalLink size={12} />
                </a>
              )}

              {portfolio && (
                <a
                  href={portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-2.5 text-xs font-medium text-slate-400 transition hover:border-white/[0.14] hover:text-white"
                >
                  <Globe size={15} />
                  Portfolio
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left */}
        <div className="space-y-5">
          {/* About */}
          <section className="rounded-[24px] border border-white/[0.08] bg-[#0F1726] p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05]">
                <UserRound
                  size={15}
                  className="text-cyan-300"
                />
              </div>

              <h2 className="font-semibold text-white">
                About
              </h2>
            </div>

            {profile.bio ? (
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-400">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-5 text-sm italic text-slate-600">
                This developer hasn't added a bio yet.
              </p>
            )}
          </section>

          {/* Experience */}
          <section className="rounded-[24px] border border-white/[0.08] bg-[#0F1726] p-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05]">
                <BriefcaseBusiness
                  size={15}
                  className="text-cyan-300"
                />
              </div>

              <h2 className="font-semibold text-white">
                Experience
              </h2>
            </div>

            {experience.length > 0 ? (
              <div className="mt-6 space-y-5">
                {experience.map((item, index) => (
                  <div
                    key={
                      item?._id ||
                      `${item?.company || "experience"}-${index}`
                    }
                    className="relative border-l border-white/[0.08] pl-5"
                  >
                    <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#0F1726] bg-cyan-400" />

                    <h3 className="font-semibold text-white">
                      {item?.role ||
                        item?.title ||
                        "Developer"}
                    </h3>

                    {item?.company && (
                      <p className="mt-1 text-sm text-cyan-300/80">
                        {item.company}
                      </p>
                    )}

                    {(item?.startDate ||
                      item?.endDate) && (
                      <p className="mt-2 text-xs text-slate-600">
                        {item.startDate || ""}
                        {item.startDate &&
                        item.endDate
                          ? " — "
                          : ""}
                        {item.endDate || ""}
                      </p>
                    )}

                    {item?.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm italic text-slate-600">
                No experience has been added yet.
              </p>
            )}
          </section>
        </div>

        {/* Right */}
        <aside className="space-y-5">
          {/* Skills */}
          <section className="rounded-[24px] border border-white/[0.08] bg-[#0F1726] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">
                Skills
              </h2>

              <span className="text-xs text-slate-600">
                {skills.length}
              </span>
            </div>

            {skills.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-lg border border-cyan-400/10 bg-cyan-400/[0.05] px-2.5 py-1.5 text-xs font-medium text-cyan-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm italic text-slate-600">
                No skills listed yet.
              </p>
            )}
          </section>

          {/* Developer Snapshot */}
          <section className="rounded-[24px] border border-white/[0.08] bg-[#0F1726] p-6">
            <h2 className="font-semibold text-white">
              Developer snapshot
            </h2>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0A1220] px-4 py-3">
                <span className="text-xs text-slate-500">
                  Skills
                </span>

                <span className="text-sm font-semibold text-white">
                  {skills.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0A1220] px-4 py-3">
                <span className="text-xs text-slate-500">
                  Experience
                </span>

                <span className="text-sm font-semibold text-white">
                  {experience.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0A1220] px-4 py-3">
                <span className="text-xs text-slate-500">
                  Status
                </span>

                <span
                  className={`text-sm font-semibold ${
                    isOnline
                      ? "text-emerald-300"
                      : "text-slate-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </section>

          {/* Connect */}
          <section className="rounded-[24px] border border-cyan-400/10 bg-cyan-400/[0.035] p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
              <MessageCircle
                size={17}
                className="text-cyan-300"
              />
            </div>

            <h2 className="mt-4 font-semibold text-white">
              Build together
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Connect with this developer and
              collaborate on projects inside DevConnect.
            </p>

            <div className="mt-5">
              <StatusButton userId={userId} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default PublicProfile;