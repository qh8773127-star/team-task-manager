import axios from 'axios';

const api = axios.create({
  baseURL: 'https://team-task-manager-backend-m3o224xa6-gam-z.vercel.app/api',
  withCredentials: true,
});

export default api;