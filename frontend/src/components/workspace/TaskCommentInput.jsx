import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function TaskCommentInput({
  task,
  onAdded,
}) {
  const token = localStorage.getItem("token");

  const [text, setText] =
    useState("");

  async function send() {
    if (!text.trim()) return;

    await axios.post(
      `${API}/task-comments/${task._id}`,
      {
        content: text,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setText("");

    onAdded();
  }

  return (
    <div className="mt-6">

      <textarea
        value={text}
        onChange={(e) =>
          setText(e.target.value)
        }
        rows={3}
        placeholder="Write a comment..."
        className="w-full rounded-2xl border border-[#263243] bg-[#0B1220] p-4 outline-none focus:border-cyan-500"
      />

      <button
        onClick={send}
        className="mt-4 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black"
      >
        Comment
      </button>

    </div>
  );
}

export default TaskCommentInput;