import axios from "axios";

const API = "http://localhost:5000/api";

export async function connectRepository(projectId, repositoryUrl) {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API}/projects/${projectId}/github/connect`,
    { repositoryUrl },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
}

export async function fetchRepository(projectId) {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    `${API}/projects/${projectId}/github`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.repository;
}