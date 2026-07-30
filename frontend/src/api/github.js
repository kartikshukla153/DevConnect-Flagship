import axios from "axios";

const API = "http://localhost:5000/api";

export async function connectRepository(projectId, url) {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API}/repository/${projectId}/connect`,
    { url },
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
    `${API}/repository/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.repository;
}

export async function fetchCommits(projectId) {
  const token = localStorage.getItem("token");

  const res = await axios.get(
    `${API}/repository/${projectId}/commits`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.commits;
}