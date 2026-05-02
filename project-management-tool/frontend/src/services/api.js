import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pmt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
};

export const projectApi = {
  list: () => api.get("/projects"),
  getById: (projectId) => api.get(`/projects/${projectId}`),
  create: (payload) => api.post("/projects", payload),
  update: (projectId, payload) => api.put(`/projects/${projectId}`, payload),
  remove: (projectId) => api.delete(`/projects/${projectId}`),
};

export const taskApi = {
  list: (projectId) => api.get("/tasks", { params: projectId ? { project: projectId } : undefined }),
  getById: (taskId) => api.get(`/tasks/${taskId}`),
  create: (payload) => api.post("/tasks", payload),
  update: (taskId, payload) => api.put(`/tasks/${taskId}`, payload),
  remove: (taskId) => api.delete(`/tasks/${taskId}`),
};

export const commentApi = {
  list: (taskId) => api.get("/comments", { params: taskId ? { task: taskId } : undefined }),
  create: (payload) => api.post("/comments", payload),
  remove: (commentId) => api.delete(`/comments/${commentId}`),
};

export const notificationApi = {
  list: () => api.get("/notifications"),
  markRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};
