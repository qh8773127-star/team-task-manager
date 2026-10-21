import axios from 'axios';

const api = axios.create({
  baseURL: 'https://team-task-manager-nine-teal.vercel.app/api',
  withCredentials: true,
});

export default api;