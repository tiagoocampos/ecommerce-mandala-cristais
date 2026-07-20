import axios from "axios";
import { getToken } from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
});

// Injeta o token automaticamente em toda requisição, se existir.
// Isso evita ter que passar { headers: getAuthHeaders() } manualmente
// em cada chamada — mas continua funcionando nos lugares que já fazem
// isso manualmente (o valor final é o mesmo).
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


