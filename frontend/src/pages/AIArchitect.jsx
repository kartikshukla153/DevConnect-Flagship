import { useState } from "react";
import axios from "axios";

import ProjectHeader from "../components/ai/ProjectHeader";
import ProgressCard from "../components/ai/ProgressCard";
import TechStack from "../components/ai/TechStack";
import MilestoneCard from "../components/ai/MilestoneCard";
import Workspace from "../components/ai/Workspace";
const API = "http://localhost:5000/api";

function AIArchitect() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState(null);

  const token = localStorage.getItem("token");

  const generateProject = async () => {
    if (!idea.trim()) return;

    try {
      setLoading(true);

      const roadmapRes = await axios.post(
        `${API}/ai/generate-roadmap`,
        {
          idea,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const projectId = roadmapRes.data.project._id;

      const workspaceRes = await axios.get(
        `${API}/ai/workspace/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWorkspace(workspaceRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate project.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "40px auto",
        padding: 20,
      }}
    >
      <h1
        style={{
          fontSize: 40,
          marginBottom: 25,
        }}
      >
        🤖 AI Project Architect
      </h1>

      <textarea
  rows={6}
  value={idea}
  onChange={(e) => setIdea(e.target.value)}
  placeholder="Describe your project..."
  style={{
    width: "100%",
    padding: 15,
    marginTop: 20,
    fontSize: 16,
    background: "#ffffff",
    color: "#000000",
    border: "1px solid #ccc",
    borderRadius: "8px",
    outline: "none",
  }}
/>

      <button
        onClick={generateProject}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "14px 28px",
          fontSize: 18,
          cursor: "pointer",
          borderRadius: 10,
        }}
      >
        {loading
          ? "Generating..."
          : "Generate AI Workspace"}
      </button>

     {workspace && (
  <Workspace workspace={workspace} />
)}
    </div>
  );
}

export default AIArchitect;