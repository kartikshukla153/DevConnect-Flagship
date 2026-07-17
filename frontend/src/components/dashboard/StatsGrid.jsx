import { useEffect, useState } from "react";
import {
  User,
  BriefcaseBusiness,
  Code2,
  MapPin,
} from "lucide-react";

import { getMyProfile } from "../../services/profileService";

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#111827] p-6 transition hover:border-cyan-400/40">
      <div className="flex items-center justify-between">
        <Icon className="text-cyan-400" size={26} />
        <span className="text-3xl font-bold text-white">
          {value}
        </span>
      </div>

      <h3 className="mt-6 text-sm uppercase tracking-wider text-gray-400">
        {title}
      </h3>
    </div>
  );
}

function StatsGrid() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const p = await getMyProfile();
      setProfile(p);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        icon={User}
        title="Skills"
        value={profile?.skills?.length || 0}
      />

      <StatCard
        icon={BriefcaseBusiness}
        title="Experience"
        value={profile?.experience?.length || 0}
      />

      <StatCard
        icon={Code2}
        title="Username"
        value={profile?.username || "--"}
      />

      <StatCard
        icon={MapPin}
        title="Location"
        value={profile?.location || "--"}
      />

    </div>
  );
}

export default StatsGrid;