import { Users } from "lucide-react";

const members = [
  "Kartik",
  "Rahul",
  "Ankit",
  "Riya",
];

function OnlineMembers() {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6">

      <div className="mb-5 flex items-center gap-3">

        <Users
          size={20}
          className="text-cyan-400"
        />

        <h2 className="text-lg font-semibold">
          Online
        </h2>

      </div>

      <div className="space-y-4">

        {members.map((member) => (
          <div
            key={member}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">

              <div className="h-10 w-10 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-black">

                {member[0]}

              </div>

              <span>{member}</span>

            </div>

            <div className="h-3 w-3 rounded-full bg-green-400" />

          </div>
        ))}

      </div>

    </div>
  );
}

export default OnlineMembers;