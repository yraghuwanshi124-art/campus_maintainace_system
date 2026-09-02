import axios from "axios";

const api = axios.create({
  baseURL: "https://campus-maintainace-system-pmm9.vercel.app",
});

export default api;