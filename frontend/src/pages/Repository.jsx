import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { fetchRepository } from "../api/github";

function Repository() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [repository, setRepository] = useState(null);

  useEffect(() => {
    loadRepository();
  }, [id]);

  async function loadRepository() {
    try {
      setLoading(true);

      const data = await fetchRepository(id);

      setRepository(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-slate-400">
        Loading Repository...
      </div>
    );
  }

  if (!repository) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-red-400">
        No Repository Connected
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">

      <div className="mx-auto max-w-7xl space-y-8 p-8">

        <div className="rounded-3xl border border-slate-800 bg-[#111827] p-8">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm uppercase tracking-widest text-cyan-400">
                Repository
              </p>

              <h1 className="mt-2 text-4xl font-bold">
                {repository.fullName}
              </h1>

              <p className="mt-4 text-slate-400">
                {repository.description || "No description"}
              </p>

            </div>

            <a
              href={repository.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-black hover:bg-cyan-400"
            >
              Open on GitHub
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Repository;