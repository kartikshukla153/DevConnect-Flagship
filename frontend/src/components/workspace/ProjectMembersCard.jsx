import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  Clock3,
  Check,
  X,
} from "lucide-react";

const API = "http://localhost:5000/api/projects";

function ProjectMembersCard({
  project,
  reloadWorkspace,
}) {
  const token = localStorage.getItem("token");

   const currentUser = JSON.parse(
    localStorage.getItem("user")
  );
  

  
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (project?._id) {
      loadMembers();
    }
  }, [project]);

  async function loadMembers() {
    try {
      setLoading(true);

    const res = await axios.get(
  `${API}/members/${project._id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


      setMembers(res.data.members || []);
      setRequests(res.data.joinRequests || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function approve(userId) {
    try {
      await axios.put(
        `${API}/approve-request/${project._id}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadMembers();
      reloadWorkspace?.();

      alert("Developer approved.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to approve request."
      );
    }
  }

  async function reject(userId) {
    try {
      await axios.put(
        `${API}/reject-request/${project._id}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadMembers();
      reloadWorkspace?.();

      alert("Request rejected.");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to reject request."
      );
    }
  }

const myRole =
  members.find(
    (m) => m.user?._id === currentUser?.id
  )?.role || "";

  const canManage =
    myRole === "owner" ||
    myRole === "admin";

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6">

      <div className="mb-6 flex items-center gap-3">

        <Users className="text-cyan-400" />

        <h2 className="text-xl font-bold">
          Team
        </h2>

      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">
          Loading...
        </div>
      ) : (
        <>
          <div className="space-y-3">

            {members.map((member) => (

              <div
                key={member.user._id}
                className="flex items-center justify-between rounded-2xl border border-[#263243] bg-[#0B1220] p-4"
              >

                <div>

                  <h3 className="font-semibold">
                    {member.user.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {member.user.email}
                  </p>

                </div>

                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-300 capitalize">
                  {member.role}
                </span>

              </div>

            ))}

          </div>
  

          {canManage && (
            <>
              <div className="my-6 border-t border-white/10" />

              <div className="mb-4 flex items-center gap-2">

                <Clock3
                  size={18}
                  className="text-yellow-400"
                />

                <h3 className="font-semibold">
                  Pending Join Requests
                </h3>

              </div>

              {requests.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No pending requests.
                </p>
              ) : (
                <div className="space-y-3">

                  {requests.map((user) => (

                    <div
                      key={user._id}
                      className="rounded-2xl border border-[#263243] bg-[#0B1220] p-4"
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <h4 className="font-semibold">
                            {user.name}
                          </h4>

                          <p className="text-sm text-gray-500">
                            {user.email}
                          </p>

                        </div>

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              approve(user._id)
                            }
                            className="rounded-xl bg-green-500 px-3 py-2 text-white hover:bg-green-400"
                          >

                            <Check size={16} />

                          </button>

                          <button
                            onClick={() =>
                              reject(user._id)
                            }
                            className="rounded-xl bg-red-500 px-3 py-2 text-white hover:bg-red-400"
                          >

                            <X size={16} />

                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>
              )}
            </>
          )}
        </>
      )}

    </div>
  );
}

export default ProjectMembersCard;