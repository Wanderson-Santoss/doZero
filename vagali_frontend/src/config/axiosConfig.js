// src/config/axiosConfig.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1/",
});

// Interceptor para colocar o token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); 
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper para setar token manualmente (opcional)
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
  } else {
    localStorage.removeItem("authToken");
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
