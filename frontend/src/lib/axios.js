import axios from "axios";

const api = axios.create({
  baseURL: "https://backend-iota-pied-19.vercel.app/api",
  withCredentials: true, 
});

export default api;