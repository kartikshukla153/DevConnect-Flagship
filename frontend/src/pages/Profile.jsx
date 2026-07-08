import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/profile/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);

      setProfile(res.data.profile);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteExperience = async (expId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this experience?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

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
      console.log(err.response?.data || err.message);

      alert(
        err.response?.data?.message ||
          "Failed to delete experience"
      );
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        Loading Profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        Profile Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-white p-8">
      <div className="max-w-5xl mx-auto bg-white/5 border border-white/10 rounded-xl p-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

          <div>
            <h1 className="text-4xl font-bold mb-2">
              {profile.user?.name}
            </h1>

            <p className="text-cyan-400 text-lg">
              @{profile.username}
            </p>

            {profile.location && (
              <p className="text-white/60 mt-2">
                📍 {profile.location}
              </p>
            )}
          </div>

          <div className="flex gap-3">

            <button
              onClick={() => {
                window.location.href = "/create-profile";
              }}
              className="px-5 py-3 bg-cyan-500 text-black rounded-lg font-semibold"
            >
              Edit Profile
            </button>

            <button
              onClick={() => {
                window.location.href = "/add-experience";
              }}
              className="px-5 py-3 bg-green-500 text-black rounded-lg font-semibold"
            >
              Add Experience
            </button>

          </div>
        </div>

        {/* HEADLINE */}
        {profile.headline && (
          <div className="mb-6">
            <h2 className="text-2xl">
              {profile.headline}
            </h2>
          </div>
        )}

        {/* BIO */}
        {profile.bio && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-3">
              About
            </h3>

            <p className="text-white/70 leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* SKILLS */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">
            Skills
          </h3>

          <div className="flex flex-wrap gap-3">
            {profile.skills?.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* EXPERIENCE */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-4">
            Experience
          </h3>

          {!profile.experience ||
          profile.experience.length === 0 ? (
            <div className="text-white/50">
              No experience added yet.
            </div>
          ) : (
            <div className="space-y-4">
              {profile.experience.map((exp) => (
                <div
                  key={exp._id}
                  className="p-5 bg-white/5 border border-white/10 rounded-xl"
                >
                  <h4 className="text-lg font-semibold">
                    {exp.title}
                  </h4>

                  <p className="text-cyan-400">
                    {exp.company}
                  </p>

                  {exp.location && (
                    <p className="text-white/50 mt-1">
                      📍 {exp.location}
                    </p>
                  )}

                  <p className="text-white/40 text-sm mt-2">
                    {new Date(exp.startDate).toLocaleDateString()}
                    {" - "}
                    {exp.current
                      ? "Present"
                      : exp.endDate
                      ? new Date(exp.endDate).toLocaleDateString()
                      : "Present"}
                  </p>

                  {exp.description && (
                    <p className="text-white/70 mt-3">
                      {exp.description}
                    </p>
                  )}

                  <button
                    onClick={() => deleteExperience(exp._id)}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Delete Experience
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SOCIAL LINKS */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Social Links
          </h3>

          <div className="flex flex-wrap gap-4">

            {profile.socialLinks?.github && (
              <a
                href={profile.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              >
                GitHub
              </a>
            )}

            {profile.socialLinks?.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              >
                LinkedIn
              </a>
            )}

            {profile.socialLinks?.portfolio && (
              <a
                href={profile.socialLinks.portfolio}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              >
                Portfolio
              </a>
            )}

            {profile.socialLinks?.twitter && (
              <a
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              >
                Twitter
              </a>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;