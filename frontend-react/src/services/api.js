import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// إضافة الـ JWT تلقائيًا لكل الطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("siraj_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// التعامل مع الأخطاء العامة (مثل انتهاء صلاحية التوكن)
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
