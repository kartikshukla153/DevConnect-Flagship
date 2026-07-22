import { useEffect, useState } from "react";
import axios from "axios";
import { X, Search, UserPlus } from "lucide-react";

const API = "http://localhost:5000/api";

function InviteMemberModal({
  open,
  onClose,
  projectId,
  refreshTeam,
}) {
  const token = localStorage.getItem("token");

  const [developers, setDevelopers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) loadDevelopers();
  }, [open]);

  async function loadDevelopers() {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/search/users?keyword=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDevelopers(res.data.users || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      loadDevelopers();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  async function invite(userId) {
    try {
      await axios.post(
        `${API}/invitations`,
        {
          projectId,
          receiverId: userId,
          role: "member",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      refreshTeam?.();

      alert("Invitation Sent");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to invite"
      );
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">

      <div className="w-full max-w-2xl rounded-3xl border border-[#263243] bg-[#111827]">

        <div className="flex items-center justify-between border-b border-[#263243] p-6">

          <h2 className="text-xl font-bold">
            Invite Developer
          </h2>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        <div className="p-6">

          <div className="relative mb-6">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              placeholder="Search developers..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-2xl border border-[#263243] bg-[#0B1220] py-3 pl-11 pr-4 outline-none focus:border-cyan-400"
            />

          </div>

          <div className="max-h-[420px] space-y-3 overflow-y-auto">

            {loading && (
              <p className="text-center text-gray-400">
                Loading...
              </p>
            )}
   
            {!loading &&
              developers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between rounded-2xl border border-[#263243] bg-[#0B1220] p-4"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">

                      {user.name?.charAt(0)}

                    </div>

                    <div>

                      <h3 className="font-semibold">

                        {user.name}

                      </h3>

                      <p className="text-sm text-gray-500">

                        {user.email}

                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      invite(user._id)
                    }
                    className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-black transition hover:bg-cyan-300"
                  >

                    <UserPlus size={16} />

                    Invite

                  </button>

                </div>
              ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default InviteMemberModal;