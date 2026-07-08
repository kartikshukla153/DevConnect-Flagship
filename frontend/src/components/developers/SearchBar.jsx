function SearchBar({
  skill,
  setSkill,
  searchDevelopers,
  clearSearch,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-3 mb-8">

      <input
        type="text"
        placeholder="Search by skill..."
        value={skill}
        onChange={(e) => setSkill(e.target.value)}
        className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-500"
      />

      <button
        onClick={searchDevelopers}
        className="px-5 py-3 bg-cyan-500 text-black rounded-lg font-semibold hover:bg-cyan-400 transition"
      >
        Search
      </button>

      <button
        onClick={clearSearch}
        className="px-5 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
      >
        Clear
      </button>

    </div>
  );
}

export default SearchBar;