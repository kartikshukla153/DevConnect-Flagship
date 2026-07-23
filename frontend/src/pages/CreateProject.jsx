import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api/projects";

function CreateProject() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    overview: "",
    techStack: "",
    rolesNeeded: "",
    githubRepo: "",
    liveLink: "",
    difficulty: "Intermediate",
    estimatedWeeks: 4,
  });

  const changeHandler = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await axios.post(
        API,
        {
          ...form,
          techStack: form.techStack
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),

          rolesNeeded: form.rolesNeeded
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Project Created!");

      navigate("/workspace");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl">

      <div className="rounded-3xl border border-white/10 bg-[#111827] p-10">

        <h1 className="mb-8 text-4xl font-bold">
          Create Project
        </h1>

        <form
          onSubmit={submitHandler}
          className="space-y-6"
        >

          <input
            name="title"
            placeholder="Project Title"
            onChange={changeHandler}
            className="w-full rounded-xl bg-[#0B1220] p-4"
          />

          <textarea
            rows={4}
            name="description"
            placeholder="Short Description"
            onChange={changeHandler}
            className="w-full rounded-xl bg-[#0B1220] p-4"
          />

          <textarea
            rows={5}
            name="overview"
            placeholder="Detailed Overview"
            onChange={changeHandler}
            className="w-full rounded-xl bg-[#0B1220] p-4"
          />

          <input
            name="techStack"
            placeholder="React, Node, MongoDB"
            onChange={changeHandler}
            className="w-full rounded-xl bg-[#0B1220] p-4"
          />

          <input
            name="rolesNeeded"
            placeholder="Frontend, Backend, UI Designer"
            onChange={changeHandler}
            className="w-full rounded-xl bg-[#0B1220] p-4"
          />

          <input
            name="githubRepo"
            placeholder="Github Repository"
            onChange={changeHandler}
            className="w-full rounded-xl bg-[#0B1220] p-4"
          />

          <input
            name="liveLink"
            placeholder="Live URL"
            onChange={changeHandler}
            className="w-full rounded-xl bg-[#0B1220] p-4"
          />

          <button
  type="submit"
  disabled={loading}
  className="rounded-xl bg-cyan-400 px-8 py-4 font-semibold text-black"
>
            {loading ? "Creating..." : "Create Project"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateProject;