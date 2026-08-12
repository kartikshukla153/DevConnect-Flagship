import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Globe,
  MapPin,
  RefreshCw,
} from "lucide-react";

import ProfileHero from "../components/profile/ProfileHero";
import FeaturedProjects from "../components/profile/FeaturedProjects";
import ExperienceTimeline from "../components/profile/ExperienceTimeline";
import Achievements from "../components/profile/Achievements";
import ContributionHeatmap from "../components/dashboard/ContributionHeatmap";

const API = "http://localhost:5000/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setError("You need to log in to view your profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(`${API}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!data?.profile) {
        throw new Error("Profile data was not returned by the server.");
      }

      setProfile(data.profile);
    } catch (err) {
      console.error(
        "PROFILE LOAD ERROR:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const profileCompletion = useMemo(() => {
    if (!profile) return 0;

    const fields = [
      Boolean(profile.user?.name),
      Boolean(profile.username?.trim()),
      Boolean(profile.headline?.trim()),
      Boolean(profile.bio?.trim()),
      Array.isArray(profile.skills) && profile.skills.length > 0,
      Boolean(profile.location?.trim()),
      Array.isArray(profile.experience) &&
        profile.experience.length > 0,
      Boolean(profile.socialLinks?.github),
      Boolean(profile.socialLinks?.linkedin),
      Boolean(profile.socialLinks?.portfolio),
    ];

    const completed = fields.filter(Boolean).length;

    return Math.round((completed / fields.length) * 100);
  }, [profile]);

  const completionMessage = useMemo(() => {
    if (profileCompletion >= 90) {
      return "Excellent. Your profile is recruiter ready.";
    }

    if (profileCompletion >= 70) {
      return "Strong profile. Add a few more details to make it stand out.";
    }

    if (profileCompletion >= 40) {
      return "Good start. Complete more sections to improve your visibility.";
    }

    return "Complete your developer profile to make a stronger first impression.";
  }, [profileCompletion]);

  const completionColor =
    profileCompletion >= 90
      ? "text-emerald-300"
      : profileCompletion >= 70
        ? "text-cyan-300"
        : profileCompletion >= 40
          ? "text-amber-300"
          : "text-slate-300";

  const socialLinks = [
    {
      label: "GitHub",
      value: profile?.socialLinks?.github,
    },
    {
      label: "LinkedIn",
      value: profile?.socialLinks?.linkedin,
    },
    {
      label: "Portfolio",
      value: profile?.socialLinks?.portfolio,
    },
    {
      label: "Twitter / X",
      value: profile?.socialLinks?.twitter,
    },
  ].filter((item) => item.value);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-[#111827] px-10 py-12 text-center shadow-2xl">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />

          <h2 className="text-xl font-semibold text-white">
            Loading your developer profile
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Fetching your latest profile information...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-[#111827] p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <AlertCircle
              size={26}
              className="text-red-400"
            />
          </div>

          <h2 className="mt-6 text-2xl font-bold text-white">
            We couldn't load your profile
          </h2>

          <p className="mt-3 leading-7 text-slate-400">
            {error ||
              "Something went wrong while loading your developer profile."}
          </p>

          <button
            onClick={fetchProfile}
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300"
          >
            <RefreshCw size={17} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const skills = Array.isArray(profile.skills)
    ? profile.skills
    : [];

  const experience = Array.isArray(profile.experience)
    ? profile.experience
    : [];

  const projects = Array.isArray(profile.projects)
    ? profile.projects
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* HERO */}
      <ProfileHero profile={profile} />

      {/* PROFILE STATUS STRIP */}
      <section className="rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10">
              {profileCompletion >= 90 ? (
                <CheckCircle2
                  size={21}
                  className="text-emerald-400"
                />
              ) : (
                <Globe
                  size={21}
                  className="text-cyan-400"
                />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-semibold text-white">
                  Developer profile strength
                </h2>

                <span
                  className={`text-sm font-bold ${completionColor}`}
                >
                  {profileCompletion}%
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                {completionMessage}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              window.location.href = "/create-profile";
            }}
            className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/20"
          >
            Improve Profile
          </button>
        </div>

        <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-700"
            style={{
              width: `${profileCompletion}%`,
            }}
          />
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      <FeaturedProjects projects={projects} />

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="col-span-12 space-y-8 xl:col-span-8">
          {/* ABOUT */}
          <section className="rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                About
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                A quick introduction about this developer.
              </p>
            </div>

            <p className="leading-8 text-slate-300">
              {profile.bio?.trim()
                ? profile.bio
                : "No bio has been added yet. Tell other developers and recruiters about yourself, your interests and what you're currently building."}
            </p>
          </section>

          {/* TECH STACK */}
          <section className="rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">
                Tech Stack
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Technologies and skills this developer works with.
              </p>
            </div>

            {skills.length ? (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/40 hover:bg-cyan-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] p-10 text-center">
                <p className="text-slate-500">
                  No skills have been added yet.
                </p>
              </div>
            )}
          </section>

          {/* EXPERIENCE */}
          <ExperienceTimeline experience={experience} />

          {/* CONTRIBUTIONS */}
          <ContributionHeatmap />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-12 space-y-8 xl:col-span-4">
          {/* PROFILE OVERVIEW */}
          <section className="rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white">
              Profile Overview
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              A quick snapshot of your developer profile.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">
                <span className="text-slate-400">
                  Skills
                </span>

                <span className="text-xl font-bold text-white">
                  {skills.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">
                <span className="text-slate-400">
                  Experience
                </span>

                <span className="text-xl font-bold text-white">
                  {experience.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">
                <span className="text-slate-400">
                  Featured Projects
                </span>

                <span className="text-xl font-bold text-white">
                  {projects.length}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">
                <span className="text-slate-400">
                  Status
                </span>

                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
            </div>

            {profile.location && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">
                <MapPin
                  size={18}
                  className="text-cyan-400"
                />

                <span className="text-sm text-slate-300">
                  {profile.location}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                window.location.href = "/create-profile";
              }}
              className="mt-6 w-full rounded-2xl bg-cyan-400 px-6 py-4 text-base font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Edit Profile
            </button>
          </section>

          {/* SOCIAL LINKS */}
          <section className="rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white">
              Connect
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Professional links and developer presence.
            </p>

            <div className="mt-6 space-y-3">
              {socialLinks.length ? (
                socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.value}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                  >
                    <div className="flex items-center gap-3">
                      <Globe
                        size={18}
                        className="text-cyan-400"
                      />

                      <span className="font-medium text-white">
                        {link.label}
                      </span>
                    </div>

                    <ExternalLink
                      size={16}
                      className="text-slate-500 transition group-hover:text-cyan-300"
                    />
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] p-8 text-center">
                  <p className="text-slate-500">
                    No social links added yet.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ACHIEVEMENTS */}
          <Achievements />

          {/* PROFILE COMPLETION */}
          <section className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-[#111827] p-8 shadow-xl">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
              Developer Profile
            </span>

            <h2 className="mt-5 text-3xl font-bold text-white">
              Make your profile impossible to ignore.
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Recruiters and collaborators should understand what
              you build, what you know and how to reach you within
              seconds.
            </p>

            <div className="mt-8">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Profile Completion
                </span>

                <span
                  className={`font-semibold ${completionColor}`}
                >
                  {profileCompletion}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 transition-all duration-700"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                window.location.href = "/create-profile";
              }}
              className="mt-8 w-full rounded-2xl bg-cyan-400 px-6 py-4 text-base font-semibold text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Complete Profile
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;