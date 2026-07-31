import axios from "axios";

const API = "http://localhost:5000/api";

function authHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };
}

export async function connectRepository(projectId, url) {
  const res = await axios.post(
    `${API}/repository/${projectId}/connect`,
    { url },
    authHeaders()
  );

  return res.data;
}

export async function fetchRepository(projectId) {
  const res = await axios.get(
    `${API}/repository/${projectId}`,
    authHeaders()
  );

  return res.data.repository;
}

export async function fetchCommits(projectId) {
  const res = await axios.get(
    `${API}/repository/${projectId}/commits`,
    authHeaders()
  );

  return res.data.commits;
}

export async function fetchContributors(projectId) {
  const res = await axios.get(
    `${API}/repository/${projectId}/contributors`,
    authHeaders()
  );

  return res.data.contributors;
}

export async function fetchLanguages(projectId) {
  const res = await axios.get(
    `${API}/repository/${projectId}/languages`,
    authHeaders()
  );

  return res.data.languages;
}

export async function fetchAnalytics(projectId) {
  const res = await axios.get(
    `${API}/repository/${projectId}/analytics`,
    authHeaders()
  );

  return res.data.analytics;
}