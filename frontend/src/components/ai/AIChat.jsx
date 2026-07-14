import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function AIChat({ projectId }) {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const askAI = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/ai-chat`,
        {
          message,
          projectId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReply(res.data.reply);
    } catch (err) {
      console.log(err);
      alert("AI failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        width: 360,
        background: "#0f172a",
        borderRadius: 15,
        padding: 20,
        color: "white",
        zIndex: 999,
        boxShadow: "0 0 30px rgba(0,0,0,.5)",
      }}
    >
      <h2>🤖 AI Copilot</h2>

      <textarea
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask about this project..."
        style={{
          width: "100%",
          marginTop: 15,
          padding: 10,
          color: "black",
        }}
      />

      <button
        onClick={askAI}
        disabled={loading}
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
        }}
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {reply && (
        <div
          style={{
            marginTop: 20,
            whiteSpace: "pre-wrap",
            background: "#1e293b",
            padding: 15,
            borderRadius: 10,
          }}
        >
          {reply}
        </div>
      )}
    </div>
  );
}