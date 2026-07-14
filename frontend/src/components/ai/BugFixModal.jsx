import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function BugFixModal({ onClose }) {
  const token = localStorage.getItem("token");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fixBug = async () => {
    if (!code.trim()) {
      alert("Paste some code first.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${API}/ai-bug/fix`,
        { code },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data);
    } catch (err) {
      console.log(err);
      alert("Bug fixing failed.");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.fixedCode);
    alert("Copied!");
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-[#161b22] w-[1000px] h-[750px] rounded-xl p-6 overflow-auto">

        <div className="flex justify-between mb-6">

          <h1 className="text-3xl font-bold text-white">
            🐞 AI Bug Fixer
          </h1>

          <button
            onClick={onClose}
            className="text-white text-2xl"
          >
            ✕
          </button>

        </div>

        <textarea
          value={code}
          onChange={(e)=>setCode(e.target.value)}
          placeholder="Paste broken code here..."
          className="w-full h-56 bg-black text-green-400 rounded-lg p-4 mb-6"
        />

        <button
          onClick={fixBug}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded text-white"
        >
          {loading ? "Fixing..." : "🐞 Fix Bug"}
        </button>

        {result && (

          <>

            <div className="mt-8">

              <h2 className="text-red-400 text-xl font-bold mb-3">
                Bugs Found
              </h2>

              <ul className="list-disc pl-6 text-gray-300">
                {result.bugs.map((b,i)=>(
                  <li key={i}>{b}</li>
                ))}
              </ul>

            </div>

            <div className="mt-8">

              <h2 className="text-blue-400 text-xl font-bold mb-3">
                Explanation
              </h2>

              <p className="text-gray-300 whitespace-pre-wrap">
                {result.explanation}
              </p>

            </div>

            <div className="mt-8">

              <div className="flex justify-between mb-3">

                <h2 className="text-green-400 text-xl font-bold">
                  Fixed Code
                </h2>

                <button
                  onClick={copy}
                  className="bg-blue-600 px-4 py-2 rounded"
                >
                  Copy
                </button>

              </div>

              <pre className="bg-black text-green-400 p-5 rounded-lg whitespace-pre-wrap overflow-auto">
                {result.fixedCode}
              </pre>

            </div>

            <div className="mt-8">

              <h2 className="text-yellow-400 text-xl font-bold mb-3">
                Best Practices
              </h2>

              <ul className="list-disc pl-6 text-gray-300">
                {result.bestPractices.map((b,i)=>(
                  <li key={i}>{b}</li>
                ))}
              </ul>

            </div>

          </>

        )}

      </div>

    </div>
  );
}