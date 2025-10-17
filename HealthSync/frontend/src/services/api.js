import axios from "axios";

const API = axios.create({
  // Use relative base URL and rely on Vite proxy in dev, same-origin in prod
  baseURL: (import.meta?.env?.VITE_API_BASE_URL || '/api'),
});

// Automatically attach token if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  try {
    const user = JSON.parse(localStorage.getItem("user") || 'null');
    const roleRaw = user?.role;
    const roleUp = roleRaw?.toUpperCase?.();
    // Normalize to backend-expected roles
    const role = roleUp === 'PARAMEDICS' ? 'PARAMEDIC' : roleUp;
    if (role) {
      config.headers['X-Role'] = role;
      config.headers['X-User-Role'] = role;
    }
    const uid = user?.id || user?._id || user?.userId;
    if (uid) {
      config.headers['X-User-Id'] = uid;
      config.headers['X-UserId'] = uid;
    }
  } catch {}
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
