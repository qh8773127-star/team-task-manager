import axios from 'axios';

const api = axios.create({
  baseURL: 'https://team-task-manager-api-sandy.vercel.app/api',
  withCredentials: true,
});

export default api;