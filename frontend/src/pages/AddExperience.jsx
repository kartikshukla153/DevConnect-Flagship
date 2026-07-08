import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddExperience() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const saveExperience = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/profile/experience",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("EXPERIENCE ADDED:", res.data);

      navigate("/profile");
    } catch (err) {
      console.log(
        "EXPERIENCE ERROR:",
        err.response?.data || err.message
      );

      alert(
        err.response?.data?.message ||
          "Failed to add experience"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-white flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-xl p-6">

        <h1 className="text-3xl font-bold mb-6">
          Add Experience
        </h1>

        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
        />

        <input
          type="text"
          name="company"
          placeholder="Company"
          value={formData.company}
          onChange={handleChange}
          className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full p-3 mb-3 bg-black/30 border border-white/10 rounded"
        />

        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="w-full p-3 bg-black/30 border border-white/10 rounded"
          />

          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            disabled={formData.current}
            className="w-full p-3 bg-black/30 border border-white/10 rounded"
          />
        </div>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="current"
            checked={formData.current}
            onChange={handleChange}
          />
          Currently Working Here
        </label>

        <textarea
          name="description"
          placeholder="Describe your work..."
          value={formData.description}
          onChange={handleChange}
          rows="5"
          className="w-full p-3 mb-5 bg-black/30 border border-white/10 rounded"
        />
    
        <button
          onClick={saveExperience}
          className="w-full py-3 bg-cyan-500 text-black rounded font-semibold"
        >
          Save Experience
        </button>

      </div>
    </div>
  );
}

export default AddExperience;