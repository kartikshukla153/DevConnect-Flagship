import { useEffect, useState } from "react";
import axios from "axios";

export default function useSuggestedDevelopers() {
  const [developers, setDevelopers] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/conversations/suggested",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDevelopers(res.data.developers);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDevelopers();
  }, []);

  return developers;
}