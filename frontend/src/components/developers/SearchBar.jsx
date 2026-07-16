import { Search, RotateCcw } from "lucide-react";

function SearchBar({
  skill,
  setSkill,
  searchDevelopers,
  clearSearch,
}) {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827] p-6 mb-8">

      <div className="flex flex-col lg:flex-row gap-4">

        <div className="relative flex-1">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />

          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchDevelopers();
              }
            }}
            placeholder="Search developers by skill (React, Node.js, AI, Java...)"
            className="
              w-full
              rounded-2xl
              border
              border-[#374151]
              bg-[#0B1220]
              py-4
              pl-12
              pr-4
              text-white
              placeholder:text-gray-500
              outline-none
              transition
              focus:border-cyan-400
            "
          />

        </div>

        <button
          onClick={searchDevelopers}
          className="
            rounded-2xl
            bg-cyan-400
            hover:bg-cyan-300
            transition
            px-8
            font-semibold
            text-black
          "
        >
          Search
        </button>

        <button
          onClick={clearSearch}
          className="
            rounded-2xl
            border
            border-[#374151]
            bg-[#0B1220]
            hover:bg-[#1F2937]
            transition
            px-6
            flex
            items-center
            justify-center
            gap-2
          "
        >
          <RotateCcw size={18} />
          Reset
        </button>

      </div>

    </div>
  );
}

export default SearchBar;