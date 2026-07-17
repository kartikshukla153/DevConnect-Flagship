import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/tasks";

function CreateTaskModal({
  projectId,
  onCreated,
}) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  });

  const submit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        API,
        {
          ...form,
          project: projectId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setForm({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
      });

      onCreated?.();

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-8">

      <h2 className="mb-6 text-2xl font-bold">
        Create Task
      </h2>

      <form
        onSubmit={submit}
        className="space-y-4"
      >

        <input
          placeholder="Task title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
          className="w-full rounded-xl bg-[#0B1220] p-4"
        />

        <textarea
          rows={4}
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
          className="w-full rounded-xl bg-[#0B1220] p-4"
        />

        <button className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black">
          Create Task
        </button>

      </form>

    </div>
  );
}

export default CreateTaskModal;