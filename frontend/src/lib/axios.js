  import axios from "axios";

  const api = axios.create({
    baseURL: "https://team-task-manager-2q2q.onrender.com/api",
    // baseURL: "http://localhost:5000/api",
    withCredentials: true, 
  });

  export default api;