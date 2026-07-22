import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  UserPlus,
  Clock3,
} from "lucide-react";

import MemberCard from "./MemberCard";
import InviteMemberModal from "./InviteMemberModal";

const API = "http://localhost:5000/api";

function MembersPanel({
  projectId,
  currentUser,
}) {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState([]);

  const [joinRequests, setJoinRequests] =
    useState([]);

  const [pendingInvites, setPendingInvites] =
    useState([]);

  const [inviteOpen, setInviteOpen] =
    useState(false);

  async function loadMembers() {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/projects/members/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers(res.data.members || []);
      setJoinRequests(
        res.data.joinRequests || []
      );
      setPendingInvites(
        res.data.pendingInvites || []
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      loadMembers();
    }
  }, [projectId]);

  async function approve(userId) {
    try {
      await axios.put(
        `${API}/projects/approve-request/${projectId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadMembers();
    } catch (err) {
      console.log(err);
    }
  }

  async function reject(userId) {
    try {
      await axios.put(
        `${API}/projects/reject-request/${projectId}/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadMembers();
    } catch (err) {
      console.log(err);
    }
  }

  async function removeMember(userId) {
    try {
      await axios.delete(
        `${API}/projects/member/${projectId}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      loadMembers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to remove member"
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#263243] bg-[#111827] p-8 text-center text-gray-400">
        Loading Team...
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="flex items-center gap-2 text-2xl font-bold">

              <Users size={24} />

              Team Members

            </h2>

            <p className="mt-1 text-gray-400">

              {members.length} Members

            </p>

          </div>

          <button
            onClick={() =>
              setInviteOpen(true)
            }
            className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-black hover:bg-cyan-300"
          >
            <UserPlus size={18} />
            Invite
          </button>

        </div>

        <div className="space-y-4">

          {members.map((member) => (
            <MemberCard
              key={member.user._id}
              member={member}
              owner={
                currentUser ===
                member.user._id
              }
              onRemove={
                removeMember
              }
              onlineUsers={[]}
            />
          ))}

        </div>

        {joinRequests.length > 0 && (
          <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

            <h3 className="mb-5 text-lg font-semibold">

              Pending Join Requests

            </h3>

            <div className="space-y-3">

              {joinRequests.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between rounded-2xl border border-[#263243] bg-[#0B1220] p-4"
                >

                  <div>

                    <h4 className="font-semibold">

                      {user.name}

                    </h4>

                    <p className="text-sm text-gray-500">

                      {user.email}

                    </p>

                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        approve(user._id)
                      }
                      className="rounded-xl bg-green-500 px-4 py-2 font-medium"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        reject(user._id)
                      }
                      className="rounded-xl bg-red-500 px-4 py-2 font-medium"
                    >
                      Reject
                    </button>

                  </div>

                </div>
              ))}

            </div>

          </div>
        )}

        {pendingInvites.length > 0 && (
          <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

            <h3 className="mb-5 flex items-center gap-2 text-lg font-semibold">

              <Clock3 size={18} />

              Pending Invites

            </h3>

            <div className="space-y-3">

              {pendingInvites.map((invite) => (
                <div
                  key={invite.user._id}
                  className="flex items-center justify-between rounded-2xl border border-[#263243] bg-[#0B1220] p-4"
                >

                  <div>

                    <h4 className="font-semibold">

                      {invite.user.name}

                    </h4>

                    <p className="text-sm text-gray-500">

                      {invite.user.email}

                    </p>

                  </div>

                  <span className="rounded-full bg-yellow-500/20 px-4 py-2 text-sm text-yellow-400">

                    Waiting...

                  </span>

                </div>
              ))}

            </div>

          </div>
        )}

      </div>

      <InviteMemberModal
        open={inviteOpen}
        onClose={() =>
          setInviteOpen(false)
        }
        projectId={projectId}
        refreshTeam={loadMembers}
      />
    </>
  );
}

export default MembersPanel;