import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem("token");

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
          placeholder="GitHub URL"
          value={formData.github}
          onChange={handleChange}
          className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
        />

        <input
          name="linkedin"
          placeholder="LinkedIn URL"
          value={formData.linkedin}
          onChange={handleChange}
          className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
        />

        <input
          name="portfolio"
          placeholder="Portfolio URL"
          value={formData.portfolio}
          onChange={handleChange}
          className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
        />

        <input
          name="twitter"
          placeholder="Twitter URL"
          value={formData.twitter}
          onChange={handleChange}
          className="w-full p-3 mb-5 bg-black/30 border border-white/10 rounded"
        />

        <button
          onClick={saveProfile}
          className="w-full py-3 bg-cyan-500 text-black rounded font-semibold"
        >
          Save Profile
        </button>

      </div>
    </div>
  );
}

export default CreateProfile;