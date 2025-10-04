import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  getCurrentUser: () => api.get("/users/me"),
  initUser: () => api.post("/users/init"),
  updateProfile: (data) => api.put("/users/profile", data),
  updateSkills: (data) => api.put("/users/skills", data),
  getUserById: (userId) => api.get(`/users/${userId}`),
  uploadVerificationDocs: (documents) =>
    api.post("/users/verification/documents", { documents }),
};

// Match API
export const matchAPI = {
  findMatches: (data) => api.post("/match/find", data),
  getMatchExplanation: (targetUserId) =>
    api.get(`/match/explain/${targetUserId}`),
};

// Session API
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
