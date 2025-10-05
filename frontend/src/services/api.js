import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  getCurrentUser: () => api.get("/users/me"),
  initUser: () => api.post("/users/init"),
  updateProfile: (data) => api.put("/users/profile", data),
  updateSkills: (data) => api.put("/users/skills", data),
  getUserById: (userId) => api.get(`/users/${userId}`),
  uploadVerificationDocs: (documents) =>
    api.post("/users/verification/documents", { documents }),
};

export const matchAPI = {
  findMatches: (data) => api.post("/match/find", data),
  getMatchExplanation: (targetUserId) =>
    api.get(`/match/explain/${targetUserId}`),
};

export const sessionAPI = {
  createSwapRequest: (data) => api.post("/sessions", data),
  getUserSessions: (status) => api.get("/sessions", { params: { status } }),
  getSessionDetails: (sessionId) => api.get(`/sessions/${sessionId}`),
  updateSessionStatus: (sessionId, data) =>
    api.put(`/sessions/${sessionId}/status`, data),
  submitFeedback: (sessionId, data) =>
    api.post(`/sessions/${sessionId}/feedback`, data),
};

export default api;
