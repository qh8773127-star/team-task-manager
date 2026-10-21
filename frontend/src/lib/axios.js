import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-iota-pied-19.vercel.app",
  withCredentials: true, 
});

export default api;