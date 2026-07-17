import { useState } from "react";

import WorkspaceHeader from "../components/workspace/WorkspaceHeader";
import WorkspaceTabs from "../components/workspace/WorkspaceTabs";
import OverviewTab from "../components/workspace/OverviewTab";
import MembersTab from "../components/workspace/MembersTab";

function ProjectWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");

  // Temporary data.
  // This will come from backend in the next batch.

  const project = {
    title: "DevConnect",

    description:
      "A production-grade developer collaboration platform inspired by GitHub, Slack, Linear and Jira.",

    updatedAt: new Date(),

    members: [
      {
        _id: "1",
        name: "Kartik",
        role: "Owner",
      },
      {
        _id: "2",
        name: "Alex",
        role: "Backend Developer",
      },
    ],

    tasks: [
      {
        completed: true,
      },
      {
        completed: false,
      },
      {
        completed: false,
      },
    ],
  };

  return (
    <div className="space-y-8">

      <WorkspaceHeader project={project} />

      <WorkspaceTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "Overview" && (
        <OverviewTab project={project} />
      )}

      {activeTab === "Members" && (
        <MembersTab
          members={project.members}
        />
      )}

      {activeTab !== "Overview" &&
        activeTab !== "Members" && (

          <div className="rounded-3xl border border-[#263243] bg-[#111827] p-16 text-center">

            <h2 className="text-2xl font-bold">
              {activeTab}
            </h2>

            <p className="mt-4 text-gray-400">
              This section will be connected to the backend in the upcoming batches.
            </p>

          </div>

        )}

    </div>
  );
}

export default ProjectWorkspace;