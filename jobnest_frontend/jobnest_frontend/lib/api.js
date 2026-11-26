import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",

});

// Attach access token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized response handling for auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    // Avoid forcing a full-page redirect for authentication requests
    const requestUrl = error.config?.url || "";
    const isAuthEndpoint = /token|login|refresh/i.test(requestUrl);

    if (status === 401 && !isAuthEndpoint) {
      // Clear tokens and redirect to login to keep backend expectations intact
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;