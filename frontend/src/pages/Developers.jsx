import { useEffect, useState } from "react";
import axios from "axios";

import DeveloperCard from "../components/developers/DeveloperCard";
import SearchBar from "../components/developers/SearchBar";
import useOnlineUsers from "../hooks/useOnlineUsers";

function Developers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skill, setSkill] = useState("");

  const onlineUsers = useOnlineUsers();

  const fetchDevelopers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/profile"
      );

      setProfiles(res.data.profiles || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchDevelopers = async () => {
    try {
      setLoading(true);

      if (!skill.trim()) {
        return fetchDevelopers();
      }

      const res = await axios.get(
        `http://localhost:5000/api/profile/search/skills?skill=${skill}`
      );

      setProfiles(res.data.profiles || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSkill("");
    fetchDevelopers();
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center text-white">
        Loading Developers...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A12] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Discover Developers
        </h1>

        <SearchBar
          skill={skill}
          setSkill={setSkill}
          searchDevelopers={searchDevelopers}
          clearSearch={clearSearch}
        />

        {profiles.length === 0 ? (
          <div className="text-white/50">
            No developers found.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <DeveloperCard
                key={profile._id}
                profile={profile}
                onlineUsers={onlineUsers}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Developers;