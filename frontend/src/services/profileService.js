import axios from "axios";

const API = "http://localhost:5000/api/profile";

const auth = {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
};

export const getMyProfile = async () => {
  const res = await axios.get(`${API}/me`, auth);
  return res.data.profile;
};