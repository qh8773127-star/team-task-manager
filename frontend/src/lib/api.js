import api from "./axios";
export const authApi = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getUsers: () => api.get("/auth/users"),
};
export const teamApi = {
  getAll: () => api.get("/teams"),
  create: (data) => api.post("/teams", data),
  delete: (teamId) => api.delete(`/teams/${teamId}`),
  addMember: (teamId, email) => api.post(`/teams/${teamId}/members`, { email }),
  getTeamMembers: (teamId) => api.get(`/teams/${teamId}/members`),
};

export const taskApi = {
  getByTeam: (teamId) => api.get(`/tasks?team_id=${teamId}`),
  create: (data) => api.post("/tasks", data),
  updateStatus: (taskId, status) => api.put(`/tasks/${taskId}`, { status }),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
};
