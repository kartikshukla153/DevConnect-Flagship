import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function DocsPanel({ project }) {
  const token = localStorage.getItem("token");

  const [docs, setDocs] = useState(null);
  const [tab, setTab] = useState("readme");

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    try {
      const res = await axios.post(
        `${API}/ai-docs/generate`,
        { project },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDocs(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!docs) return <p>Generating AI Docs...</p>;

  const tabs = [
    "readme",
    "architecture",
    "database",
    "api",
  ];

  return (
    <div
      style={{
        marginTop: 40,
        background: "#111827",
        padding: 25,
        borderRadius: 15,
      }}
    >
      <h2 style={{ color: "white" }}>
        AI Documentation
      </h2>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          color: "#d1d5db",
          marginTop: 20,
        }}
      >
        {docs[tab]}
      </pre>
    </div>
  );
}