import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://vasundhara-theatre-backend.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("movie-ticket-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
