import { useEffect, useState } from "react";
import axios from "axios";


import {
  MapPin,
  Pencil,
  Plus,
  Globe,
  BriefcaseBusiness,
  Trash2,
} from "lucide-react";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/profile/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(res.data.profile);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (expId) => {
    if (
      !window.confirm(
        "Delete this experience?"
      )
    )
      return;

    try {
      await axios.delete(
        `http://localhost:5000/api/profile/experience/${expId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchProfile();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="text-gray-400 text-xl">
        Loading profile...
      </div>
    </div>
  );
}

  if (!profile) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="text-gray-400 text-xl">
        Profile not found.
      </div>
    </div>
  );
}

  return (
  <div className="mx-auto max-w-7xl">

        {/* HERO */}

        <div className="relative overflow-hidden rounded-3xl border border-[#263243] bg-[#111827]">

          <div className="h-48 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600" />

          <div className="px-10 pb-10">

            <div className="-mt-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

              <div className="flex gap-6">

                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#111827] bg-cyan-500 text-5xl font-bold text-black shadow-xl">
                  {profile.user?.name?.charAt(0)}
                </div>

                <div className="pt-10">

                  <h1 className="text-4xl font-bold">
                    {profile.user?.name}
                  </h1>

                  <p className="mt-2 text-cyan-400">
                    @{profile.username}
                  </p>

                  {profile.headline && (
                    <p className="mt-3 text-lg text-gray-300">
                      {profile.headline}
                    </p>
                  )}

                  {profile.location && (
                    <div className="mt-4 flex items-center gap-2 text-gray-400">
                      <MapPin size={16} />
                      {profile.location}
                    </div>
                  )}

                </div>

              </div>

              <div className="flex gap-4">

                <button
                  onClick={() =>
                    (window.location.href =
                      "/create-profile")
                  }
                  className="flex items-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black hover:bg-cyan-300"
                >
                  <Pencil size={18} />
                  Edit Profile
                </button>

                <button
                  onClick={() =>
                    (window.location.href =
                      "/add-experience")
                  }
                  className="flex items-center gap-2 rounded-xl border border-[#374151] bg-[#0B1220] px-6 py-3 hover:border-cyan-400"
                >
                  <Plus size={18} />
                  Experience
                </button>

              </div>

            </div>

          </div>

        </div>
        {/* MAIN GRID */}

        <div className="mt-8 grid gap-8 xl:grid-cols-3">

          {/* LEFT */}

          <div className="xl:col-span-2 space-y-8">

            {/* ABOUT */}

            <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

              <h2 className="mb-6 text-2xl font-bold">
                About
              </h2>

              <p className="leading-8 text-gray-300">
                {profile.bio ||
                  "No bio added yet."}
              </p>

            </section>

            {/* SKILLS */}

            <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

              <h2 className="mb-6 text-2xl font-bold">
                Skills
              </h2>

              <div className="flex flex-wrap gap-3">

                {profile.skills?.length ? (
                  profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-cyan-300"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No skills added.
                  </p>
                )}

              </div>

            </section>

            {/* EXPERIENCE */}

            <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

              <h2 className="mb-8 text-2xl font-bold">
                Experience
              </h2>

              {!profile.experience ||
              profile.experience.length === 0 ? (

                <p className="text-gray-500">
                  No experience yet.
                </p>

              ) : (

                <div className="space-y-6">

                  {profile.experience.map((exp) => (

                    <div
                      key={exp._id}
                      className="rounded-2xl border border-[#374151] bg-[#0B1220] p-6 transition hover:border-cyan-500"
                    >

                      <div className="flex justify-between gap-6">

                        <div className="flex-1">

                          <div className="flex items-center gap-3">

                            <BriefcaseBusiness
                              size={20}
                              className="text-cyan-400"
                            />

                            <h3 className="text-xl font-semibold">
                              {exp.title}
                            </h3>

                          </div>

                          <p className="mt-3 text-cyan-400">
                            {exp.company}
                          </p>

                          {exp.location && (
                            <p className="mt-2 text-gray-500">
                              {exp.location}
                            </p>
                          )}

                          <p className="mt-3 text-sm text-gray-500">

                            {new Date(
                              exp.startDate
                            ).toLocaleDateString()}

                            {"  •  "}

                            {exp.current
                              ? "Present"
                              : exp.endDate
                              ? new Date(
                                  exp.endDate
                                ).toLocaleDateString()
                              : "Present"}

                          </p>

                          {exp.description && (
                            <p className="mt-5 leading-7 text-gray-300">
                              {exp.description}
                            </p>
                          )}

                        </div>

                        <button
                          onClick={() =>
                            deleteExperience(
                              exp._id
                            )
                          }
                          className="h-fit rounded-xl border border-red-500/20 bg-red-500/10 p-3 transition hover:bg-red-500/20"
                        >
                          <Trash2
                            size={18}
                            className="text-red-400"
                          />
                        </button>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </section>

          </div>

          {/* RIGHT SIDEBAR */}

          <div className="space-y-8">

            {/* STATS */}

            <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

              <h2 className="mb-6 text-2xl font-bold">
                Profile Stats
              </h2>

              <div className="space-y-5">

                <div className="flex justify-between">

                  <span className="text-gray-400">
                    Skills
                  </span>

                  <span className="font-bold">
                    {profile.skills?.length || 0}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-400">
                    Experience
                  </span>

                  <span className="font-bold">
                    {profile.experience?.length || 0}
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-400">
                    Status
                  </span>

                  <span className="font-semibold text-cyan-400">
                    Active
                  </span>

                </div>

              </div>

            </section>
            {/* SOCIAL LINKS */}

            <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

              <h2 className="mb-6 text-2xl font-bold">
                Social Links
              </h2>

              <div className="space-y-4">

                {profile.socialLinks?.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[#374151] bg-[#0B1220] p-4 transition hover:border-cyan-400"
                  >
                    GitHub
                    <span>GitHub</span>
                  </a>
                )}

                {profile.socialLinks?.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[#374151] bg-[#0B1220] p-4 transition hover:border-cyan-400"
                  >
                    <span>💼</span>
                    <span>LinkedIn</span>
                  </a>
                )}

                {profile.socialLinks?.portfolio && (
                  <a
                    href={profile.socialLinks.portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[#374151] bg-[#0B1220] p-4 transition hover:border-cyan-400"
                  >
                    <Globe size={20} />
                    <span>Portfolio</span>
                  </a>
                )}

                {profile.socialLinks?.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[#374151] bg-[#0B1220] p-4 transition hover:border-cyan-400"
                  >
                    <span>𝕏</span>
                    <span>Twitter</span>
                  </a>
                )}

                {!profile.socialLinks?.github &&
                  !profile.socialLinks?.linkedin &&
                  !profile.socialLinks?.portfolio &&
                  !profile.socialLinks?.twitter && (
                    <p className="text-gray-500">
                      No social links added.
                    </p>
                  )}

              </div>

            </section>

            {/* PROFILE COMPLETION */}

            <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-8">

              <h2 className="text-2xl font-bold">
                DevConnect Profile
              </h2>

              <p className="mt-3 text-gray-300 leading-7">
                Keep your profile updated to improve discoverability,
                collaboration opportunities, recruiter visibility,
                and AI-powered recommendations.
              </p>

              <button
                onClick={() =>
                  (window.location.href =
                    "/create-profile")
                }
                className="mt-6 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black transition hover:bg-cyan-300"
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