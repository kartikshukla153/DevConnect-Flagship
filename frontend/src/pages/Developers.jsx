import { useEffect, useState } from "react";
import axios from "axios";

import AppLayout from "../layout/AppLayout";

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
      console.log(err);
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
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  return (
    <AppLayout>

      <div className="flex items-end justify-between mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            Discover Developers
          </h1>

          <p className="text-gray-400 mt-2">
            Find teammates, contributors and future collaborators.
          </p>

        </div>

      </div>

      <SearchBar
        skill={skill}
        setSkill={setSkill}
        searchDevelopers={searchDevelopers}
        clearSearch={()=>{
          setSkill("");
          fetchDevelopers();
        }}
      />

      {loading ? (

        <div className="text-gray-500 mt-16">
          Loading developers...
        </div>

      ) : (

        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3 mt-10">

          {profiles.map((profile)=>(
            <DeveloperCard
              key={profile._id}
              profile={profile}
              onlineUsers={onlineUsers}
            />
          ))}

        </div>

      )}

    </AppLayout>
  );
}

export default Developers;