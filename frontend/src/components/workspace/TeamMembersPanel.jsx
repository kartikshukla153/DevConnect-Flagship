import { useEffect, useState } from "react";
import axios from "axios";
import { Users, UserPlus } from "lucide-react";

import InviteMemberModal from "./InviteMemberModal";
import MemberCard from "./MemberCard";
import { getProjectSocket } from "../../socket/projectSocket";

const API = "http://localhost:5000/api";

function TeamMembersPanel({
  project,
  reloadWorkspace,
}) {
  const token = localStorage.getItem("token");

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [openInvite, setOpenInvite] =
    useState(false);

  const [onlineUsers, setOnlineUsers] =
    useState([]);

  useEffect(() => {
    const socket = getProjectSocket();

    if (!socket) return;

    const updateUsers = (users) => {
      setOnlineUsers(users || []);
    };

    socket.on(
      "onlineUsers",
      updateUsers
    );

    socket.on(
      "team_presence_updated",
      updateUsers
    );

    return () => {
      socket.off(
        "onlineUsers",
        updateUsers
      );

      socket.off(
        "team_presence_updated",
        updateUsers
      );
    };
  }, []);

  const myMember =
    project.members?.find(
      (m) =>
        m.user?._id === currentUser?.id
    ) || null;

  const canManage =
    myMember?.role === "owner" ||
    myMember?.role === "admin";

  async function removeMember(memberId) {
    if (
      !window.confirm(
        "Remove this member?"
      )
    )
      return;

    try {
      await axios.delete(
        `${API}/invitations/member`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            projectId: project._id,
            memberId,
          },
        }
      );

      reloadWorkspace();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to remove member"
      );
    }
  }

  return (
    <>
      <div className="rounded-3xl border border-[#263243] bg-[#111827]">

        <div className="flex items-center justify-between border-b border-[#263243] p-6">

          <div className="flex items-center gap-3">

            <Users
              size={20}
              className="text-cyan-400"
            />

            <h2 className="text-lg font-semibold">
              Team Members
            </h2>

          </div>

          {canManage && (
            <button
              onClick={() =>
                setOpenInvite(true)
              }
              className="flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-black transition hover:bg-cyan-300"
            >
              <UserPlus size={16} />
              Invite
            </button>
          )}

        </div>

        <div className="space-y-4 p-6">

          {project.members?.map(
            (member) => (
              <MemberCard
                key={member.user?._id}
                member={member}
                owner={
                  myMember?.role ===
                  "owner"
                }
                onRemove={
                  removeMember
                }
                onlineUsers={
                  onlineUsers
                }
              />
            )
          )}

        </div>

      </div>

      <InviteMemberModal
        open={openInvite}
        onClose={() =>
          setOpenInvite(false)
        }
        projectId={project._id}
        refreshTeam={reloadWorkspace}
      />
    </>
  );
}

export default TeamMembersPanel;