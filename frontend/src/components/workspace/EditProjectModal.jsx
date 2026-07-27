import { useEffect, useState } from "react";
import axios from "axios";
import { connectRepository } from "../../api/github";


const API = "http://localhost:5000/api";

function EditProjectModal({
  open,
  onClose,
  project,
  refreshProject,
}) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    overview: "",
    difficulty: "",
    estimatedWeeks: "",
    githubRepo: "",
    liveLink: "",
  });

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || "",
        description: project.description || "",
        overview: project.overview || "",
        difficulty: project.difficulty || "",
        estimatedWeeks: project.estimatedWeeks || "",
        githubRepo: project.githubRepo || "",
        liveLink: project.liveLink || "",
      });
    }
  }, [project]);

 async function saveProject() {
  try {

    await axios.put(
      `${API}/projects/${project._id}`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (
      form.githubRepo &&
      form.githubRepo.includes("github.com")
    ) {

      await connectRepository(
        project._id,
        form.githubRepo
      );

    }

    await refreshProject();

    onClose();

  } catch (err) {

    console.log(err);

    alert("Unable to update project.");

  }
}

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-full max-w-3xl rounded-3xl bg-[#111827] p-8">

        <h2 className="mb-6 text-2xl font-bold text-white">
          Edit Project
        </h2>

        <div className="space-y-4">

          <input
            className="w-full rounded-xl bg-[#1F2937] p-3 text-white"
            placeholder="Project Title"
            value={form.title}
            onChange={(e)=>
              setForm({
                ...form,
                title:e.target.value
              })
            }
          />

          <textarea
            className="h-24 w-full rounded-xl bg-[#1F2937] p-3 text-white"
            placeholder="Description"
            value={form.description}
            onChange={(e)=>
              setForm({
                ...form,
                description:e.target.value
              })
            }
          />

          <textarea
            className="h-24 w-full rounded-xl bg-[#1F2937] p-3 text-white"
            placeholder="Overview"
            value={form.overview}
            onChange={(e)=>
              setForm({
                ...form,
                overview:e.target.value
              })
            }
          />

          <input
            className="w-full rounded-xl bg-[#1F2937] p-3 text-white"
            placeholder="GitHub Repository"
            value={form.githubRepo}
            onChange={(e)=>
              setForm({
                ...form,
                githubRepo:e.target.value
              })
            }
          />

          <input
            className="w-full rounded-xl bg-[#1F2937] p-3 text-white"
            placeholder="Live Demo"
            value={form.liveLink}
            onChange={(e)=>
              setForm({
                ...form,
                liveLink:e.target.value
              })
            }
          />

          <div className="grid grid-cols-2 gap-4">

            <input
              className="rounded-xl bg-[#1F2937] p-3 text-white"
              placeholder="Difficulty"
              value={form.difficulty}
              onChange={(e)=>
                setForm({
                  ...form,
                  difficulty:e.target.value
                })
              }
            />

            <input
              type="number"
              className="rounded-xl bg-[#1F2937] p-3 text-white"
              placeholder="Weeks"
              value={form.estimatedWeeks}
              onChange={(e)=>
                setForm({
                  ...form,
                  estimatedWeeks:e.target.value
                })
              }
            />

          </div>

        </div>

        <div className="mt-8 flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-6 py-3 text-white"
          >
            Cancel
          </button>

          <button
            onClick={saveProject}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>
  );
}

export default EditProjectModal;