import RoleBadge from "./RoleBadge";
import {
  Crown,
  Trash2,
  Shield,
} from "lucide-react";

function MemberCard({
  member,
  owner,
  onRemove,
  onlineUsers = [],
}) {
  const isOnline =
    onlineUsers.includes(
      member.user?._id
    );

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#263243] bg-[#0B1220] p-4 transition hover:border-cyan-500">

      <div className="flex items-center gap-4">

        <div className="relative">

          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 font-bold text-black">

            {member.user?.name?.charAt(0)}

          </div>

          <span
            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0B1220] ${
              isOnline
                ? "bg-green-500"
                : "bg-gray-500"
            }`}
          />

        </div>

        <div>

          <h3 className="font-semibold">

            {member.user?.name}

          </h3>

          <p className="text-sm text-gray-500">

            {member.user?.email}

          </p>

          <p
            className={`mt-1 text-xs font-medium ${
              isOnline
                ? "text-green-400"
                : "text-gray-500"
            }`}
          >
            {isOnline
              ? "Online"
              : "Offline"}
          </p>

        </div>

      </div>

      <div className="flex items-center gap-3">

        {member.role ===
          "owner" && (
          <Crown
            size={18}
            className="text-yellow-400"
          />
        )}

        {member.role ===
          "admin" && (
          <Shield
            size={18}
            className="text-cyan-400"
          />
        )}

        <RoleBadge
          role={member.role}
        />

        {owner &&
          member.role !==
            "owner" && (
            <button
              onClick={() =>
                onRemove(
                  member.user._id
                )
              }
              className="rounded-xl bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500 hover:text-white"
            >

              <Trash2
                size={16}
              />

            </button>
          )}

      </div>

    </div>
  );
}

export default MemberCard;