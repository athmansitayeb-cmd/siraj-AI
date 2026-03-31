import axios from "axios";

const api = axios.create({
  baseURL: "https://siraj.software/api/",
});

// REQUEST
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("siraj_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// RESPONSE (CRITICAL FIX)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("siraj_token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
