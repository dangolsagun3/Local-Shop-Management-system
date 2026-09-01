import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to automatically add JWT auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("shopx_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration and unified error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred.";
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Avoid redirecting if already on login/register page
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        // localStorage.removeItem("shopx_token");
        // localStorage.removeItem("shopx_user");
      }
    }

    const customError = new Error(message);
    (customError as any).status = error.response?.status;
    (customError as any).details = error.response?.data?.meta || error.response?.data?.detail;
    return Promise.reject(customError);
  }
);

export default api;
