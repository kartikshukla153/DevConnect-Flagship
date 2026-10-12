
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    headline: "",
    bio: "",
    skills: "",
    location: "",
    github: "",
    linkedin: "",
    portfolio: "",
    twitter: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

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

      const profile = res.data.profile;

      if (profile) {
        setFormData({
          username: profile.username || "",
          headline: profile.headline || "",
          bio: profile.bio || "",
          skills: profile.skills?.join(", ") || "",
          location: profile.location || "",
          github: profile.socialLinks?.github || "",
          linkedin: profile.socialLinks?.linkedin || "",
          portfolio: profile.socialLinks?.portfolio || "",
          twitter: profile.socialLinks?.twitter || "",
        });
      }
    } catch (err) {
      console.log(
        "NO EXISTING PROFILE:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveProfile = async (e) => {
    e?.preventDefault();

    if (saving) return;

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
        return;
      }

      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const res = await axios.post(
        "http://localhost:5000/api/profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("PROFILE SAVED:", res.data);
      navigate("/profile");
    } catch (err) {
      console.log(
        "PROFILE ERROR:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
          "Failed to save profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">
          Create / Edit Profile
        </h1>

        <form onSubmit={saveProfile}>
          <input
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
          />

          <input
            name="headline"
            placeholder="Headline"
            value={formData.headline}
            onChange={handleChange}
            className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
          />

          <textarea
            name="bio"
            placeholder="Bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
          />

          <input
            name="skills"
            placeholder="Java, React, Node.js"
            value={formData.skills}
            onChange={handleChange}
            className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
          />

          <input
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
          />

          <input
            name="github"
            type="url"
            placeholder="GitHub URL"
            value={formData.github}
            onChange={handleChange}
            className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
          />

          <input
            name="linkedin"
            type="url"
            placeholder="LinkedIn URL"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
          />

          <input
            name="portfolio"
            type="url"
            placeholder="Portfolio URL"
            value={formData.portfolio}
            onChange={handleChange}
            className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
          />

          <input
            name="twitter"
            type="url"
            placeholder="Twitter URL"
            value={formData.twitter}
            onChange={handleChange}
            className="w-full p-3 mb-5 bg-black/30 border border-white/10 rounded"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-cyan-500 text-black rounded font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;
