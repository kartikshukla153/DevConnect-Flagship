import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function AIArchitect() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspace] = useState(null);

  const token = localStorage.getItem("token");

  const generateProject = async () => {
    if (!idea.trim()) return;

    try {
      setLoading(true);

      const res = await axios.post(
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

      const projectId = res.data.project._id;

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
      console.log(err);
      alert("Generation Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 1200,
        margin: "auto",
      }}
    >
      <h1>🤖 AI Project Architect</h1>

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
        }}
      />

      <button
        onClick={generateProject}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "15px 30px",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Generate Project"}
      </button>

      {workspace && (
        <>
          <hr />

          <h2>{workspace.project.title}</h2>

          <p>{workspace.project.overview}</p>

          <h3>Progress</h3>

          <h2>{workspace.stats.progress}%</h2>

          <h3>Tech Stack</h3>

          <div>
            {workspace.techStack.map((tech) => (
              <span
                key={tech}
                style={{
                  padding: "8px 14px",
                  background: "#222",
                  color: "white",
                  margin: 5,
                  display: "inline-block",
                  borderRadius: 20,
                }}
              >
                {tech}
              </span>
            ))}
          </div>

          <hr />

          {workspace.milestones.map((milestone) => (
            <div
              key={milestone.title}
              style={{
                marginBottom: 35,
              }}
            >
              <h2>{milestone.title}</h2>

              {milestone.tasks.map((task) => (
                <div
                  key={task._id}
                  style={{
                    padding: 15,
                    marginBottom: 10,
                    border: "1px solid #ddd",
                    borderRadius: 10,
                  }}
                >
                  <strong>{task.title}</strong>

                  <br />

                  {task.status}
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}