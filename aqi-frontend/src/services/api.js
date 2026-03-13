import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const predictAQI = async (city) => {
  const res = await axios.post(`${API}/predict`, {
    city_name: city,
  });

  return res.data;
};