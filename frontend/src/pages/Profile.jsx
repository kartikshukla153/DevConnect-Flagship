import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Globe,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import ProfileHero from "../components/profile/ProfileHero";
import FeaturedProjects from "../components/profile/FeaturedProjects";
import ExperienceTimeline from "../components/profile/ExperienceTimeline";
import Achievements from "../components/profile/Achievements";
import ContributionHeatmap from "../components/dashboard/ContributionHeatmap";

/* =========================================================
   API
========================================================= */

const API =
  import.meta.env.VITE_API_URL?.trim() ||
  "http://localhost:5000/api";

/* =========================================================
   REAL PROFILE DESTINATIONS
========================================================= */

/*
 * These are deliberately explicit.
 *
 * We do NOT trust an old/broken database value if it points
 * to an internal DevConnect page or a fake "coming soon"
 * portfolio.
 */

const REAL_GITHUB =
  "https://github.com/kartikshukla153";

const REAL_LINKEDIN =
  "https://www.linkedin.com/in/kartik-shukla-4562033b9/";

const REAL_LIVE_WORK =
  "https://furniture-website-4wmp.onrender.com/";

/* =========================================================
   AUTH
========================================================= */

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

/* =========================================================
   ID HELPERS
========================================================= */

function normalizeId(value) {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return String(
      value?._id ||
        value?.id ||
        value?.userId ||
        value?.user?._id ||
        value?.user?.id ||
        ""
    );
  }

  return String(value);
}

function getCurrentUserId() {
  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);

      const storedId =
        parsed?.id ||
        parsed?._id ||
        parsed?.userId;

      if (storedId) {
        return String(storedId);
      }
    } catch {
      /* Ignore malformed local user data. */
    }
  }

  const token = getToken();

  if (!token) return "";

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return "";
    }

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map(
            (character) =>
              "%" +
              (
                "00" +
                character
                  .charCodeAt(0)
                  .toString(16)
              ).slice(-2)
          )
          .join("")
      )
    );

    return String(
      decoded?.id ||
        decoded?._id ||
        decoded?.userId ||
        ""
    );
  } catch {
    return "";
  }
}

/* =========================================================
   PROJECT HELPERS
========================================================= */

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) {
      return payload[key];
    }
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function belongsToCurrentUser(
  project,
  currentUserId
) {
  if (!project || !currentUserId) {
    return false;
  }

  const normalizedCurrentUserId =
    String(currentUserId);

  const possibleOwners = [
    project?.creator,
    project?.createdBy,
    project?.owner,
    project?.user,
    project?.author,
  ]
    .map(normalizeId)
    .filter(Boolean);

  if (
    possibleOwners.some(
      (id) =>
        String(id) ===
        normalizedCurrentUserId
    )
  ) {
    return true;
  }

  const members =
    project?.members ||
    project?.teamMembers ||
    project?.collaborators ||
    [];

  if (!Array.isArray(members)) {
    return false;
  }

  return members.some((member) => {
    const memberId = normalizeId(
      member?.user ||
        member?.userId ||
        member
    );

    return (
      memberId &&
      String(memberId) ===
        normalizedCurrentUserId
    );
  });
}

function normalizeProject(project) {
  return {
    ...project,

    _id:
      project?._id ||
      project?.id ||
      "",

    title:
      project?.title ||
      project?.name ||
      "Untitled project",

    description:
      project?.description ||
      project?.overview ||
      "No project description available.",

    techStack:
      Array.isArray(project?.techStack)
        ? project.techStack
        : Array.isArray(
              project?.technologies
            )
          ? project.technologies
          : [],

    members:
      Array.isArray(project?.members)
        ? project.members
        : [],

    status:
      project?.status ||
      "open",

    updatedAt:
      project?.updatedAt ||
      project?.createdAt ||
      null,

    createdAt:
      project?.createdAt ||
      null,
  };
}

/* =========================================================
   SOCIAL LINK SAFETY
========================================================= */

function normalizeExternalUrl(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  const raw = value.trim();

  try {
    const url = new URL(
      /^https?:\/\//i.test(raw)
        ? raw
        : `https://${raw}`
    );

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function isDevConnectInternalUrl(url) {
  if (!url) return true;

  try {
    const parsed = new URL(url);

    const hostname =
      parsed.hostname.toLowerCase();

    const pathname =
      parsed.pathname.toLowerCase();

    const currentHostname =
      window.location.hostname.toLowerCase();

    const isCurrentApp =
      hostname === currentHostname ||
      hostname === "localhost" ||
      hostname === "127.0.0.1";

    const looksLikeDevConnect =
      pathname.includes(
        "devconnect"
      ) ||
      pathname.includes(
        "coming-soon"
      ) ||
      pathname.includes(
        "comingsoon"
      ) ||
      pathname.includes(
        "portfolio-coming"
      );

    return (
      isCurrentApp ||
      looksLikeDevConnect
    );
  } catch {
    return true;
  }
}

function isUsablePortfolioUrl(
  value
) {
  const url =
    normalizeExternalUrl(value);

  if (!url) return false;

  return !isDevConnectInternalUrl(
    url
  );
}

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="group rounded-[24px] border border-white/[0.08] bg-[#0B1220] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-[#0d1626]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.07]">
          <Icon
            size={18}
            className="text-cyan-300"
          />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          Live
        </span>
      </div>

      <div className="mt-5 text-3xl font-black tracking-tight text-white">
        {value}
      </div>

      <div className="mt-1 text-sm font-semibold text-slate-300">
        {label}
      </div>

      <p className="mt-1 text-xs leading-5 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function SocialLink({
  label,
  subtitle,
  href,
  icon: Icon,
}) {
  const external =
    href?.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={
        external
          ? "noreferrer"
          : undefined
      }
      className="group flex items-center justify-between rounded-2xl border border-white/[0.07] bg-[#0B1220] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/25 hover:bg-cyan-500/[0.06]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06]">
          <Icon
            size={18}
            className="text-cyan-300"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {label}
          </p>

          <p className="mt-0.5 truncate text-xs text-slate-600">
            {subtitle}
          </p>
        </div>
      </div>

      <ExternalLink
        size={16}
        className="shrink-0 text-slate-600 transition group-hover:text-cyan-300"
      />
    </a>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <div className="overflow-hidden rounded-[32px] border border-white/[0.06] bg-[#111827]">
        <div className="h-48 animate-pulse bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10" />

        <div className="space-y-5 p-8">
          <div className="h-7 w-56 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-80 animate-pulse rounded bg-white/[0.05]" />
          <div className="h-4 w-64 animate-pulse rounded bg-white/[0.05]" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-[24px] bg-[#111827]"
            />
          )
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-12">
        <div className="space-y-8 xl:col-span-8">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-[28px] bg-[#111827]"
              />
            )
          )}
        </div>

        <div className="space-y-8 xl:col-span-4">
          {[1, 2].map(
            (item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-[28px] bg-[#111827]"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ERROR
========================================================= */

function ErrorState({
  message,
  onRetry,
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-[32px] border border-red-500/20 bg-[#111827] p-10 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
          <AlertCircle
            size={28}
            className="text-red-400"
          />
        </div>

        <h2 className="mt-6 text-2xl font-bold tracking-tight text-white">
          Your profile couldn't be loaded
        </h2>

        <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">
          {message ||
            "The profile service did not return valid data."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 text-sm font-bold text-[#06111d] transition hover:bg-cyan-300"
        >
          <RefreshCw size={17} />
          Reload Profile
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function Profile() {
  const navigate =
    useNavigate();

  const [profile, setProfile] =
    useState(null);

  const [connections, setConnections] =
    useState([]);

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [dataWarnings, setDataWarnings] =
    useState([]);

  const token = getToken();

  /* =======================================================
     LOAD PROFILE DATA
  ======================================================= */

  const fetchProfile =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!token) {
          setError(
            "You need to log in to view your profile."
          );

          setLoading(false);
          return;
        }

        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");
        setDataWarnings([]);

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        try {
          /*
           * Profile, connections and projects are
           * independent resources.
           *
           * One failure should not destroy the
           * entire profile experience.
           */
          const results =
            await Promise.allSettled([
              axios.get(
                `${API}/profile/me`,
                { headers }
              ),

              axios.get(
                `${API}/connections/my-connections`,
                { headers }
              ),

              axios.get(
                `${API}/projects`,
                { headers }
              ),
            ]);

          const [
            profileResult,
            connectionsResult,
            projectsResult,
          ] = results;

          /* ================================================
             PROFILE
          ================================================ */

          if (
            profileResult.status !==
            "fulfilled"
          ) {
            throw (
              profileResult.reason ||
              new Error(
                "Profile service unavailable."
              )
            );
          }

          const profilePayload =
            profileResult.value?.data;

          const rawProfile =
            profilePayload?.profile;

          if (!rawProfile) {
            throw new Error(
              "Profile data was not returned by the server."
            );
          }

          /* ================================================
             CONNECTIONS
          ================================================ */

          let nextConnections =
            [];

          let connectionCount =
            null;

          if (
            connectionsResult.status ===
            "fulfilled"
          ) {
            const payload =
              connectionsResult.value?.data;

            nextConnections =
              extractArray(
                payload,
                ["connections"]
              );

            const backendCount =
              Number(
                payload?.count
              );

            connectionCount =
              Number.isFinite(
                backendCount
              )
                ? backendCount
                : nextConnections.length;
          } else {
            setDataWarnings(
              (current) => [
                ...current,
                "Connection statistics could not be refreshed.",
              ]
            );
          }

          /* ================================================
             PROJECTS
          ================================================ */

          let nextProjects =
            [];

          let projectDataAvailable =
            false;

          if (
            projectsResult.status ===
            "fulfilled"
          ) {
            projectDataAvailable = true;

            const rawProjects =
              extractArray(
                projectsResult.value?.data,
                ["projects"]
              ).map(
                normalizeProject
              );

            const currentUserId =
              getCurrentUserId();

            /*
             * The /projects endpoint currently
             * returns the platform-wide project
             * collection.
             *
             * We therefore DO NOT use its raw
             * length as "my projects".
             *
             * A project belongs on this profile
             * when the user owns it or is a member.
             */
            nextProjects =
              rawProjects.filter(
                (project) =>
                  belongsToCurrentUser(
                    project,
                    currentUserId
                  )
              );

            /*
             * If the endpoint ever becomes user-scoped
             * and removes ownership metadata, preserve
             * the backend response rather than falsely
             * showing zero.
             */
            if (
              rawProjects.length > 0 &&
              nextProjects.length === 0
            ) {
              const hasOwnershipMetadata =
                rawProjects.some(
                  (project) =>
                    Boolean(
                      project?.creator ||
                        project?.createdBy ||
                        project?.owner ||
                        project?.user ||
                        project?.author ||
                        project?.members?.length
                    )
                );

              if (
                !hasOwnershipMetadata
              ) {
                nextProjects =
                  rawProjects;
              }
            }
          } else {
            setDataWarnings(
              (current) => [
                ...current,
                "Project statistics could not be refreshed.",
              ]
            );
          }

          /* ================================================
             BUILD AUTHORITATIVE PROFILE OBJECT
          ================================================ */

          const normalizedUser = {
            ...(rawProfile.user || {}),
          };

          /*
           * ProfileHero already understands
           * user.connections.
           *
           * Supplying the authoritative connection
           * records here fixes the old "0 connections"
           * problem without changing ProfileHero.
           */
          normalizedUser.connections =
            nextConnections;

          const nextProfile = {
            ...rawProfile,

            user: normalizedUser,

            /*
             * ProfileHero and FeaturedProjects both
             * consume profile.projects.
             */
            projects:
              projectDataAvailable
                ? nextProjects
                : [],

            /*
             * Explicit authoritative values are also
             * provided for future profile components.
             */
            connectionCount,

            projectCount:
              projectDataAvailable
                ? nextProjects.length
                : null,
          };

          setConnections(
            nextConnections
          );

          setProjects(
            nextProjects
          );

          setProfile(
            nextProfile
          );
        } catch (err) {
          console.error(
            "PROFILE LOAD ERROR:",
            err?.response?.data ||
              err?.message ||
              err
          );

          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load your developer profile."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [token]
    );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const skills = useMemo(
    () =>
      Array.isArray(
        profile?.skills
      )
        ? profile.skills
        : [],
    [profile]
  );

  const experience = useMemo(
    () =>
      Array.isArray(
        profile?.experience
      )
        ? profile.experience
        : [],
    [profile]
  );

  const realProjectCount =
    projects.length;

  const realConnectionCount =
    Number.isFinite(
      profile?.connectionCount
    )
      ? profile.connectionCount
      : connections.length;

  /* =======================================================
     PROFILE COMPLETION
  ======================================================= */

  const profileCompletion =
    useMemo(() => {
      if (!profile) return 0;

      const fields = [
        Boolean(
          profile.user?.name
        ),
        Boolean(
          profile.username?.trim()
        ),
        Boolean(
          profile.headline?.trim()
        ),
        Boolean(
          profile.bio?.trim()
        ),
        skills.length > 0,
        Boolean(
          profile.location?.trim()
        ),
        experience.length > 0,
        Boolean(
          profile.socialLinks?.github
        ),
        Boolean(
          profile.socialLinks?.linkedin
        ),
        Boolean(
          profile.socialLinks?.portfolio
        ),
      ];

      const completed =
        fields.filter(Boolean)
          .length;

      return Math.round(
        (completed /
          fields.length) *
          100
      );
    }, [
      profile,
      skills.length,
      experience.length,
    ]);

  const completionMessage =
    useMemo(() => {
      if (
        profileCompletion >= 90
      ) {
        return "Strong profile foundation. Real project evidence is what will make it stand out.";
      }

      if (
        profileCompletion >= 70
      ) {
        return "Good foundation. Add stronger project evidence and engineering activity.";
      }

      if (
        profileCompletion >= 40
      ) {
        return "Several important profile signals are still missing.";
      }

      return "Complete the core profile information before sharing it with recruiters.";
    }, [profileCompletion]);

  const completionColor =
    profileCompletion >= 90
      ? "text-emerald-300"
      : profileCompletion >= 70
        ? "text-cyan-300"
        : profileCompletion >= 40
          ? "text-amber-300"
          : "text-slate-300";

  /* =======================================================
     SOCIAL DESTINATIONS
  ======================================================= */

  const userEmail =
    profile?.user?.email ||
    "";

  const storedPortfolio =
    profile?.socialLinks
      ?.portfolio;

  const usablePortfolio =
    isUsablePortfolioUrl(
      storedPortfolio
    );

  /*
   * We intentionally do NOT use the stored Twitter
   * URL when it points to DevConnect/internal pages.
   *
   * There is no reason to send a recruiter to a
   * fake Twitter destination.
   */
  const usableTwitter =
    isUsablePortfolioUrl(
      profile?.socialLinks?.twitter
    );

  const socialItems = useMemo(
    () => {
      const items = [
        {
          label: "GitHub",
          subtitle:
            "Source code & engineering work",
          href: REAL_GITHUB,
          icon: Globe,
        },

        {
          label: "LinkedIn",
          subtitle:
            "Professional profile",
          href: REAL_LINKEDIN,
          icon: Users,
        },

        {
          label: usablePortfolio
            ? "Portfolio"
            : "Live Work",
          subtitle: usablePortfolio
            ? "Personal engineering portfolio"
            : "Deployed project",
          href:
            usablePortfolio
              ? normalizeExternalUrl(
                  storedPortfolio
                )
              : REAL_LIVE_WORK,
          icon:
            BriefcaseBusiness,
        },
      ];

      /*
       * Only expose Twitter/X if it is actually
       * a real external URL.
       */
      if (usableTwitter) {
        items.push({
          label: "Twitter / X",
          subtitle:
            "Developer presence",
          href:
            normalizeExternalUrl(
              profile?.socialLinks
                ?.twitter
            ),
          icon: Globe,
        });
      } else {
        /*
         * A recruiter needs a working fourth action.
         * Contact is much more valuable than a fake
         * Twitter link.
         */
        items.push({
          label: "Contact",
          subtitle:
            "Email Kartik directly",
          href: userEmail
            ? `mailto:${userEmail}`
            : "/create-profile",
          icon: Globe,
        });
      }

      return items;
    },
    [
      profile,
      storedPortfolio,
      usablePortfolio,
      usableTwitter,
      userEmail,
    ]
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return <LoadingState />;
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (
    error &&
    !profile
  ) {
    return (
      <ErrorState
        message={error}
        onRetry={() =>
          fetchProfile()
        }
      />
    );
  }

  if (!profile) {
    return (
      <ErrorState
        message="No developer profile was returned."
        onRetry={() =>
          fetchProfile()
        }
      />
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-14">

      {/* =================================================
          HERO
      ================================================= */}

      <ProfileHero
        profile={profile}
      />

      {/* =================================================
          DATA INTEGRITY / REFRESH STRIP
      ================================================= */}

      <section className="rounded-[28px] border border-white/[0.08] bg-[#0F1726]/95 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex min-w-0 items-start gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06]">
              <CheckCircle2
                size={18}
                className="text-emerald-400"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-white">
                  Profile data synchronized
                </p>

                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Live data
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Connections and projects are read from their
                authoritative backend resources rather than
                guessed from profile fields.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchProfile({
                silent: true,
              })
            }
            disabled={refreshing}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.06] hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh data"}
          </button>
        </div>

        {dataWarnings.length > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] px-4 py-3">
            <p className="text-xs font-semibold text-amber-300">
              Some secondary profile data could not be refreshed.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {dataWarnings.join(
                " "
              )}
            </p>
          </div>
        )}
      </section>

      {/* =================================================
          LIVE PROFILE METRICS
      ================================================= */}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Engineering snapshot
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
              What is actually on the profile
            </h2>
          </div>

          <span className="hidden text-xs text-slate-600 sm:block">
            Backend-backed metrics
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            icon={BriefcaseBusiness}
            label="Projects"
            value={realProjectCount}
            description="Projects you own or actively belong to."
          />

          <MetricCard
            icon={Users}
            label="Connections"
            value={realConnectionCount}
            description="Accepted developer connections."
          />

          <MetricCard
            icon={Globe}
            label="Technical Skills"
            value={skills.length}
            description="Skills currently listed on your profile."
          />

          <MetricCard
            icon={BriefcaseBusiness}
            label="Experience"
            value={experience.length}
            description="Professional experiences currently listed."
          />

        </div>
      </section>

      {/* =================================================
          PROFILE STRENGTH
      ================================================= */}

      <section className="overflow-hidden rounded-[28px] border border-cyan-500/10 bg-[#111827] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex min-w-0 items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06]">
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

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-bold text-white">
                  Developer profile strength
                </h2>

                <span
                  className={`text-sm font-black ${completionColor}`}
                >
                  {profileCompletion}%
                </span>
              </div>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                {completionMessage}
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/create-profile"
              )
            }
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] px-5 py-3 text-xs font-bold text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/10"
          >
            Improve Profile
          </button>

        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 transition-all duration-700"
            style={{
              width: `${profileCompletion}%`,
            }}
          />
        </div>

      </section>

      {/* =================================================
          FEATURED PROJECTS
      ================================================= */}

      <FeaturedProjects
        projects={projects}
      />

      {/* =================================================
          MAIN PROFILE GRID
      ================================================= */}

      <div className="grid grid-cols-12 items-start gap-8">

        {/* =================================================
            LEFT
        ================================================= */}

        <div className="col-span-12 space-y-8 xl:col-span-8">

          {/* ABOUT */}

          <section className="rounded-[28px] border border-white/[0.08] bg-[#111827] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">

            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Profile
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                About
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                The engineering story behind this profile.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-[#0B1220] p-6">

              <p className="whitespace-pre-line text-[15px] leading-8 text-slate-300">
                {profile.bio?.trim()
                  ? profile.bio
                  : "No bio has been added yet. Add a concise explanation of what you build, the engineering problems you enjoy solving, and the direction you are currently pursuing."}
              </p>

            </div>

          </section>

          {/* TECH STACK */}

          <section className="rounded-[28px] border border-white/[0.08] bg-[#111827] p-8 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">

            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Engineering
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                Technical Stack
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Technologies currently represented by the developer profile.
              </p>
            </div>

            {skills.length ? (
              <div className="flex flex-wrap gap-3">

                {skills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="rounded-xl border border-cyan-500/15 bg-cyan-500/[0.06] px-4 py-2.5 text-sm font-bold text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.09]"
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] p-10 text-center">
                <p className="text-sm text-slate-500">
                  No technical skills have been added yet.
                </p>
              </div>
            )}

          </section>

          {/* EXPERIENCE */}

          <ExperienceTimeline
            experience={experience}
          />

          {/* CONTRIBUTIONS */}

          <ContributionHeatmap />

        </div>

        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="col-span-12 space-y-8 xl:col-span-4">

          {/* PROFILE OVERVIEW */}

          <section className="rounded-[28px] border border-white/[0.08] bg-[#111827] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                At a glance
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                Profile Overview
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                A compact view of the information currently available.
              </p>
            </div>

            <div className="mt-7 space-y-3">

              {[
                [
                  "Technical Skills",
                  skills.length,
                ],
                [
                  "Experience",
                  experience.length,
                ],
                [
                  "Projects",
                  realProjectCount,
                ],
                [
                  "Connections",
                  realConnectionCount,
                ],
              ].map(
                ([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0B1220] px-5 py-4"
                  >
                    <span className="text-sm text-slate-400">
                      {label}
                    </span>

                    <span className="text-lg font-black text-white">
                      {value}
                    </span>
                  </div>
                )
              )}

              <div className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#0B1220] px-5 py-4">

                <span className="text-sm text-slate-400">
                  Status
                </span>

                <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  Active
                </span>

              </div>

            </div>

            {profile.location && (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0B1220] px-5 py-4">

                <MapPin
                  size={17}
                  className="text-cyan-400"
                />

                <span className="text-sm text-slate-300">
                  {profile.location}
                </span>

              </div>
            )}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/create-profile"
                )
              }
              className="mt-5 w-full rounded-2xl bg-cyan-400 px-6 py-4 text-sm font-black text-[#06111d] transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Edit Profile
            </button>

          </section>

          {/* PROFESSIONAL LINKS */}

          <section className="rounded-[28px] border border-white/[0.08] bg-[#111827] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Presence
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                Professional Links
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Direct, verified destinations for recruiters and collaborators.
              </p>
            </div>

            <div className="mt-6 space-y-3">

              {socialItems.map(
                (item) => (
                  <SocialLink
                    key={item.label}
                    {...item}
                  />
                )
              )}

            </div>

          </section>

          {/* ACHIEVEMENTS */}

          <Achievements />

          {/* COMPLETION */}

          <section className="overflow-hidden rounded-[28px] border border-cyan-500/15 bg-gradient-to-br from-cyan-500/[0.10] via-sky-500/[0.04] to-[#111827] p-7 shadow-[0_18px_60px_rgba(0,0,0,0.14)]">

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">
                Profile quality
              </span>

            </div>

            <h2 className="mt-5 text-2xl font-black tracking-tight text-white">
              Make the evidence speak.
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              A polished profile gets attention. Real projects,
              real engineering activity and verifiable work earn trust.
            </p>

            <div className="mt-7">

              <div className="mb-3 flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-500">
                  Profile completeness
                </span>

                <span
                  className={`text-sm font-black ${completionColor}`}
                >
                  {profileCompletion}%
                </span>

              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-700"
                  style={{
                    width: `${profileCompletion}%`,
                  }}
                />

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/create-profile"
                )
              }
              className="mt-7 w-full rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.07] px-5 py-3.5 text-sm font-bold text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.12]"
            >
              Improve Profile
            </button>

          </section>

        </div>
      </div>

      {/* =================================================
          FINAL PROFILE FOOTER
      ================================================= */}

      <section className="rounded-[28px] border border-white/[0.06] bg-[#0B1220] px-6 py-5">

        <div className="flex flex-col gap-3 text-xs sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle2
              size={14}
              className="text-emerald-400"
            />

            <span>
              Profile backed by live DevConnect data
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/projects"
              )
            }
            className="inline-flex items-center gap-1.5 font-bold text-cyan-400 transition hover:text-cyan-300"
          >
            Explore engineering work
            <ArrowUpRight
              size={13}
            />
          </button>

        </div>

      </section>

    </div>
  );
}

export default Profile;