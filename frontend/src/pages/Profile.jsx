import { useEffect, useState } from "react";
import axios from "axios";
import { Globe } from "lucide-react";

import ProfileHero from "../components/profile/ProfileHero";
import FeaturedProjects from "../components/profile/FeaturedProjects";
import ExperienceTimeline from "../components/profile/ExperienceTimeline";
import Achievements from "../components/profile/Achievements";
import ContributionHeatmap from "../components/dashboard/ContributionHeatmap";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/profile/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(data.profile);
    } catch (error) {
      console.error(
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-lg font-medium text-slate-400">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="text-lg font-medium text-slate-400">
          Profile not found.
        </div>
      </div>
    );
  }

  return (
        <div className="mx-auto max-w-7xl space-y-8">

      {/* HERO */}

      <ProfileHero profile={profile} />

      {/* FEATURED PROJECTS */}

      <FeaturedProjects
        projects={profile.projects || []}
      />

      {/* MAIN GRID */}

      <div className="grid grid-cols-12 gap-8">

        {/* LEFT COLUMN */}

        <div className="col-span-12 space-y-8 xl:col-span-8">

          {/* ABOUT */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  About
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  A quick introduction about this developer.
                </p>

              </div>

            </div>

            <p className="leading-8 text-slate-300">

              {profile.bio?.trim()
                ? profile.bio
                : "No bio has been added yet. Tell other developers and recruiters about yourself, your interests and what you're currently building."}

            </p>

          </section>

          {/* SKILLS */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-white">
                Tech Stack
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Technologies frequently used across projects.
              </p>

            </div>

            {profile.skills?.length ? (

              <div className="flex flex-wrap gap-3">

                {profile.skills.map((skill) => (

                  <span
                    key={skill}
                    className="
                      rounded-xl
                      border
                      border-cyan-500/20
                      bg-cyan-500/10
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-cyan-300
                      transition-all
                      duration-300
                      hover:border-cyan-400/40
                      hover:bg-cyan-500/20
                    "
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

          <ExperienceTimeline
            experience={profile.experience || []}
          />

          {/* CONTRIBUTIONS */}

          <ContributionHeatmap />

        </div>
                {/* RIGHT SIDEBAR */}

        <div className="col-span-12 space-y-8 xl:col-span-4">

          {/* PROFILE OVERVIEW */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">

            <h2 className="text-2xl font-bold text-white">
              Profile Overview
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              A quick snapshot of your developer profile.
            </p>

            <div className="mt-8 space-y-5">

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">

                <span className="text-slate-400">
                  Skills
                </span>

                <span className="text-xl font-bold text-white">
                  {profile.skills?.length || 0}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">

                <span className="text-slate-400">
                  Experience
                </span>

                <span className="text-xl font-bold text-white">
                  {profile.experience?.length || 0}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">

                <span className="text-slate-400">
                  Featured Projects
                </span>

                <span className="text-xl font-bold text-white">
                  {profile.projects?.length || 0}
                </span>

              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] px-5 py-4">

                <span className="text-slate-400">
                  Status
                </span>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Active
                </span>

              </div>

            </div>

          </section>

          {/* SOCIAL LINKS */}

          <section className="rounded-3xl border border-white/10 bg-[#111827] p-8">

            <h2 className="text-2xl font-bold text-white">
              Social Links
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Connect across platforms.
            </p>

            <div className="mt-8 space-y-4">

              {profile.socialLinks?.github && (

                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                >

                  <span className="font-medium text-white">
                    GitHub
                  </span>

                  <Globe
                    size={18}
                    className="text-cyan-400"
                  />

                </a>

              )}

              {profile.socialLinks?.linkedin && (

                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                >

                  <span className="font-medium text-white">
                    LinkedIn
                  </span>

                  <Globe
                    size={18}
                    className="text-cyan-400"
                  />

                </a>

              )}

              {profile.socialLinks?.portfolio && (

                <a
                  href={profile.socialLinks.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                >

                  <span className="font-medium text-white">
                    Portfolio
                  </span>

                  <Globe
                    size={18}
                    className="text-cyan-400"
                  />

                </a>

              )}

              {profile.socialLinks?.twitter && (

                <a
                  href={profile.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/10"
                >

                  <span className="font-medium text-white">
                    Twitter
                  </span>

                  <Globe
                    size={18}
                    className="text-cyan-400"
                  />

                </a>

              )}

              {!profile.socialLinks?.github &&
                !profile.socialLinks?.linkedin &&
                !profile.socialLinks?.portfolio &&
                !profile.socialLinks?.twitter && (

                  <div className="rounded-2xl border border-dashed border-white/10 bg-[#0B1220] p-8 text-center text-slate-500">

                    No social links added yet.

                  </div>

              )}

            </div>

          </section>
                    {/* ACHIEVEMENTS */}

          <Achievements />

          {/* PROFILE COMPLETION */}

          <section className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-[#111827] p-8">

            <div className="flex items-start justify-between gap-6">

              <div>

                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Developer Profile
                </span>

                <h2 className="mt-5 text-3xl font-bold text-white">
                  Keep your profile recruiter ready.
                </h2>

                <p className="mt-4 max-w-sm leading-7 text-slate-300">
                  A complete profile helps recruiters, collaborators and
                  AI recommendations understand your strengths and current
                  work much better.
                </p>

              </div>

            </div>

            <div className="mt-8">

              <div className="mb-3 flex items-center justify-between">

                <span className="text-sm text-slate-400">
                  Profile Completion
                </span>

                <span className="font-semibold text-cyan-300">
                  80%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500"
                  style={{ width: "80%" }}
                />

              </div>

            </div>

            <button
              onClick={() =>
                (window.location.href =
                  "/create-profile")
              }
              className="
                mt-8
                w-full
                rounded-2xl
                bg-cyan-400
                px-6
                py-4
                text-base
                font-semibold
                text-black
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-cyan-300
              "
            >
              Edit Profile
            </button>

          </section>

        </div>

      </div>

    </div>
  );
}

export default Profile;