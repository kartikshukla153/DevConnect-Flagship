import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Repository() {
  const { id } = useParams();

  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function test() {
      try {
        console.log("Route ID:", id);

        const res = await axios.get(
          `http://localhost:5000/api/projects/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
  "API RESPONSE:",
  JSON.stringify(res.data, null, 2)
);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    test();
  }, [id]);

  if (loading) {
    return <div style={{ color: "white" }}>Loading...</div>;
  }

  return (
    <div style={{ color: "white", padding: 40 }}>
      Repository Page Working
    </div>
  );
}

export default Repository;