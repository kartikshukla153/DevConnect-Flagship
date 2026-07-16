function FeedRightSidebar() {
  return (
    <div className="space-y-6">

      <div className="rounded-2xl bg-[#111827] border border-[#374151] p-6">

        <h2 className="font-semibold text-lg mb-4">
          Trending Skills
        </h2>

        <div className="flex flex-wrap gap-2">
          {[
            "React",
            "Node.js",
            "AI",
            "MongoDB",
            "Redis",
            "Docker",
            "System Design",
          ].map((skill) => (
            <span
              key={skill}
              className="px-3 py-2 rounded-full bg-[#1F2937] text-sm"
            >
              {skill}
            </span>
          ))}
        </div>

      </div>

      <div className="rounded-2xl bg-[#111827] border border-[#374151] p-6">

        <h2 className="font-semibold text-lg mb-4">
          Recruiter Tip
        </h2>

        <p className="text-gray-400 leading-7">
          Projects with consistent commits,
          documentation and collaboration
          stand out significantly more than
          isolated CRUD applications.
        </p>

      </div>

    </div>
  );
}

export default FeedRightSidebar;