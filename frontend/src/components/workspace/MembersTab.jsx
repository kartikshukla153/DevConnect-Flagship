import { Users } from "lucide-react";

function MembersTab({
  members = [],
}) {
  return (
    <section className="rounded-3xl border border-[#263243] bg-[#111827] p-8">

      <h2 className="mb-8 text-2xl font-bold">
        Team Members
      </h2>

      {members.length === 0 ? (

        <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-[#263243]">

          <Users
            size={34}
            className="text-cyan-400"
          />

          <h3 className="mt-5 text-lg font-semibold">
            No Members Yet
          </h3>

          <p className="mt-2 text-gray-400">
            Invite developers to collaborate on this project.
          </p>

        </div>

      ) : (

        <div className="grid gap-5 md:grid-cols-2">

          {members.map((member) => (

            <div
              key={member._id}
              className="rounded-2xl border border-[#263243] bg-[#0B1220] p-5"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400 font-bold text-black">

                  {member.name?.charAt(0)}

                </div>

                <div>

                  <h3 className="font-semibold text-white">
                    {member.name}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {member.role || "Developer"}
                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </section>
  );
}

export default MembersTab;