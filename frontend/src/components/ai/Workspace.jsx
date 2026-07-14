import { useState } from "react";
import axios from "axios";

import ProjectHeader from "./ProjectHeader";
import StatsCard from "./StatsCard";
import TechStack from "./TechStack";
import Timeline from "./Timeline";
import KanbanBoard from "./KanbanBoard";
import AIChat from "./AIChat";
import DocsPanel from "./DocsPanel";
import BugFixModal from "./BugFixModal";

const API = "http://localhost:5000/api";

function Workspace({ workspace, setWorkspace }) {
  const token = localStorage.getItem("token");

  const [showBugFix, setShowBugFix] = useState(false);

  const refreshWorkspace = async () => {
    try {
      const res = await axios.get(
        `${API}/ai/workspace/${workspace.project._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWorkspace(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const allTasks = workspace.milestones.flatMap((m) => m.tasks);

  return (
    <>
      <div style={{ marginTop: 40 }}>

        <ProjectHeader project={workspace.project} />

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 30,
          }}
        >
          <StatsCard
            title="Progress"
            value={`${workspace.stats.progress}%`}
            color="#22c55e"
          />

          <StatsCard
            title="Tasks"
            value={workspace.stats.totalTasks}
            color="#3b82f6"
          />

          <StatsCard
            title="Completed"
            value={workspace.stats.completed}
            color="#f59e0b"
          />
        </div>

        <h2 style={{ color: "white" }}>
          Tech Stack
        </h2>

        <TechStack techStack={workspace.techStack} />

        <Timeline milestones={workspace.milestones} />

        <h2
          style={{
            color: "white",
            marginTop: 35,
            marginBottom: 20,
          }}
        >
          Kanban Board
        </h2>

        <KanbanBoard
          tasks={allTasks}
          refreshWorkspace={refreshWorkspace}
        />

        <div
          style={{
            display: "flex",
            gap: 15,
            marginTop: 35,
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setShowBugFix(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg"
          >
            🐞 AI Bug Fix
          </button>
        </div>

        <DocsPanel
          project={workspace.project}
        />

        <AIChat
          projectId={workspace.project._id}
        />

      </div>

      {showBugFix && (
        <BugFixModal
          onClose={() => setShowBugFix(false)}
        />
      )}
    </>
  );
}

export default Workspace;