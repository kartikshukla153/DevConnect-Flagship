const tabs = [
  "Overview",
  "Tasks",
  "Kanban",
  "Members",
  "Files",
  "Discussion",
  "Activity",
  "AI",
];

function WorkspaceTabs({ activeTab, setActiveTab }) {
  return (
    <div className="rounded-3xl border border-[#263243] bg-[#111827] p-2">

      <div className="flex flex-wrap gap-2">

        {tabs.map((tab) => (

          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 ${
              activeTab === tab
                ? "bg-cyan-400 text-black"
                : "text-gray-400 hover:bg-[#1B2636] hover:text-white"
            }`}
          >
            {tab}
          </button>

        ))}

      </div>

    </div>
  );
}

export default WorkspaceTabs;