import axios from "axios";
import {
  clearAuth,
  getToken,
  markSessionExpired,
  saveRedirectPath,
  setToken,
  SESSION_ENDED_EVENT,
} from "../lib/auth";

const API_URL = import.meta.env.VITE_API_URL

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

// Trava: várias requisições podem falhar juntas com 401; só a primeira encerra a sessão.
let sessionEnding = false;

function endSession() {
  if (sessionEnding) return;
  sessionEnding = true;

  // guarda a rota atual para voltar depois do login
  const current = window.location.pathname + window.location.search;
  if (!current.startsWith("/login")) saveRedirectPath(current);

  clearAuth();
  markSessionExpired();
  // limpa o estado em memória (carrinho etc.) e leva ao login; o aviso aparece lá, uma única vez
  window.dispatchEvent(new Event(SESSION_ENDED_EVENT));
  window.location.replace("/login");
}

api.interceptors.response.use(
  (response) => {
    // Renovação deslizante: o backend manda um token novo quando o atual passou da metade da vida
    const renewed = response.headers?.["x-new-token"];
    if (typeof renewed === "string" && renewed && getToken()) {
      setToken(renewed);
    }
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const code = (error.response.data as { code?: string } | undefined)?.code;
      const hadToken = !!error.config?.headers?.Authorization;
      // Não intercepta o 401 do login (senha errada, sem code de token) nem requisições sem token
      if (hadToken && (code === "TOKEN_EXPIRED" || code === "TOKEN_INVALID")) {
        endSession();
      }
    }
    return Promise.reject(error);
  }
);
