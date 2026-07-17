import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsGrid from "../components/dashboard/StatsGrid";

import ActivityTimeline from "../components/dashboard/ActivityTimeline";
import QuickActions from "../components/dashboard/QuickActions";
import RecentProjects from "../components/dashboard/RecentProjects";
import MyTasks from "../components/dashboard/MyTasks";
import ContributionHeatmap from "../components/dashboard/ContributionHeatmap";

function Dashboard() {
  return (
    <div className="space-y-8">

      <DashboardHeader />

      <StatsGrid />

      <div className="grid grid-cols-12 gap-8">

        {/* LEFT */}

        <div className="col-span-12 space-y-8 xl:col-span-8">

          <ActivityTimeline />

          <RecentProjects />

          <ContributionHeatmap />

        </div>

        {/* RIGHT */}

        <div className="col-span-12 space-y-8 xl:col-span-4">

          <QuickActions />

          <MyTasks />

        </div>

      </div>

    </div>
  );
}

export default Dashboard;