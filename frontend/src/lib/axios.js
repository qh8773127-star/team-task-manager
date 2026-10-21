import axios from 'axios';

const api = axios.create({
  baseURL: 'https://team-task-manager-dfm6tkps3-gam-z.vercel.app/api',
  withCredentials: true,
});

export default api;