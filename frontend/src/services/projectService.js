import axios from "axios";

const API = "http://localhost:5000/api/projects";

const token = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getProjects = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const getProject = async (id) => {
  const res = await axios.get(`${API}/${id}`);
  return res.data;
};

export const createProject = async (data) => {
  const res = await axios.post(API, data, token());
  return res.data;
};

export const joinProject = async (id) => {
  const res = await axios.put(
    `${API}/join-request/${id}`,
    {},
    token()
  );

  return res.data;
};

export const dashboard = async (id) => {
  const res = await axios.get(
    `${API}/dashboard/${id}`,
    token()
  );

  return res.data;
};

export const activity = async (id) => {
  const res = await axios.get(
    `${API}/activity/${id}`,
    token()
  );

  return res.data;
};