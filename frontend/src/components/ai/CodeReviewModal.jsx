import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function CodeReviewModal({
  file,
  onClose,
}) {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);

  useEffect(() => {
    loadReview();
  }, []);

  const loadReview = async () => {
    try {
      const res = await axios.post(
        `${API}/ai/review`,
        {
          filename: file.filename,
          code: file.code,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReview(res.data);
    } catch (err) {
      console.log(err);
      alert("Review failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">

      <div className="bg-[#161b22] w-[1000px] h-[720px] rounded-xl p-6 overflow-auto">

        <div className="flex justify-between mb-6">

          <h1 className="text-2xl font-bold text-white">
            🤖 AI Code Review
          </h1>

          <button
            onClick={onClose}
            className="text-white"
          >
            ✕
          </button>

        </div>

        {loading && (
          <h2 className="text-white">
            Reviewing...
          </h2>
        )}

        {!loading && review && (

          <>

            <div className="bg-[#0d1117] p-5 rounded-lg mb-5">

              <h2 className="text-3xl font-bold text-green-400">

                Score : {review.score}/10

              </h2>

              <p className="text-gray-300 mt-3">

                {review.summary}

              </p>

            </div>

            <div className="grid grid-cols-3 gap-6">

              <div>

                <h3 className="text-green-400 font-bold mb-3">

                  Strengths

                </h3>

                {review.strengths?.map((s,i)=>(
                  <p key={i} className="text-gray-300 mb-2">
                    ✅ {s}
                  </p>
                ))}

              </div>

              <div>

                <h3 className="text-red-400 font-bold mb-3">

                  Issues

                </h3>

                {review.issues?.map((s,i)=>(
                  <p key={i} className="text-gray-300 mb-2">
                    ❌ {s}
                  </p>
                ))}

              </div>

              <div>

                <h3 className="text-blue-400 font-bold mb-3">

                  Improvements

                </h3>

                {review.improvements?.map((s,i)=>(
                  <p key={i} className="text-gray-300 mb-2">
                    ⭐ {s}
                  </p>
                ))}

              </div>

            </div>

            <div className="mt-8">

              <h2 className="text-xl text-white font-bold mb-3">

                Improved Version

              </h2>

              <pre className="bg-black text-green-400 p-5 rounded-xl whitespace-pre-wrap overflow-auto">

{review.improvedCode}

              </pre>

            </div>

          </>

        )}

      </div>

    </div>
  );
}