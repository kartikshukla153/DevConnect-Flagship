import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function CodeGeneratorModal({ task, onClose }) {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  const generate = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/ai/chat`,
        {
          projectId: task.project,
          message: `
Generate production-ready code for this task.

Title:
${task.title}

Description:
${task.description}

Acceptance Criteria:
${task.acceptanceCriteria?.join("\n")}

Generate complete files in JSON format.
`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("AI RESPONSE:", res.data);

      setFiles(res.data.files || []);
    } catch (err) {
      console.error(err);
      alert("Failed to generate code");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    alert("Copied!");
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
      <div className="bg-[#161b22] w-[1000px] h-[750px] rounded-xl p-6 overflow-y-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">
            🤖 AI Starter Code Generator
          </h2>

          <button
            onClick={onClose}
            className="text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg mb-8"
        >
          {loading ? "Generating..." : "Generate Starter Code"}
        </button>

        {!loading && files.length === 0 && (
          <div className="text-gray-400 text-lg">
            Click <b>Generate Starter Code</b> to generate complete production-ready files.
          </div>
        )}

        {files.map((file, index) => (
          <div
            key={index}
            className="border border-gray-700 rounded-xl mb-8 overflow-hidden"
          >
            <div className="bg-[#21262d] flex justify-between items-center p-4">
              <div>
                <h3 className="text-green-400 font-bold text-lg">
                  {file.filename}
                </h3>

                <p className="text-gray-400 text-sm">
                  {file.description}
                </p>
              </div>

              <button
                onClick={() => copyCode(file.code)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                Copy
              </button>
            </div>

            <pre className="bg-black text-green-400 p-5 overflow-x-auto whitespace-pre-wrap text-sm">
              {file.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}