import type { User } from "../types";

const TOKEN_KEY = "token";
const USER_KEY = "user";
// sessionStorage: some quando a aba fecha e não vaza entre abas/dias
const SESSION_EXPIRED_KEY = "session_expired";
const REDIRECT_KEY = "post_login_redirect";

/** Evento global disparado quando a sessão acaba (o CartContext limpa o carrinho ao ouvi-lo). */
export const SESSION_ENDED_EVENT = "auth:session-ended";

/**
 * Lê o `exp` (segundos) do JWT SEM verificar assinatura — só para tratar token vencido como
 * deslogado antes de chamar a API. Quem valida de verdade é o backend.
 */
export function getTokenExpiration(token: string): number | null {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );
        const exp = (JSON.parse(json) as { exp?: unknown }).exp;
        return typeof exp === "number" ? exp : null;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string, nowMs = Date.now()): boolean {
    const exp = getTokenExpiration(token);
    // sem exp legível: deixa o backend decidir
    return exp !== null && exp * 1000 <= nowMs;
}

/** Token válido ou null. Token vencido derruba a sessão local (e marca o aviso de expiração). */
export function getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    if (isTokenExpired(token)) {
        clearAuth();
        markSessionExpired();
        return null;
    }
    return token;
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

/** Só devolve o usuário se ainda houver token válido: menu e rotas protegidas concordam. */
export function getStoredUser(): User | null {
    if (!getToken()) return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored) as User;
    } catch {
        return null;
    }
}

export function saveAuth(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
}

export function getAuthHeaders(): { Authorization: string } | null {
    const token = getToken();
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
}

export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

export function markSessionExpired(): void {
    sessionStorage.setItem(SESSION_EXPIRED_KEY, "1");
}

/** Lê e apaga o aviso: a tela de login mostra uma vez só. */
export function consumeSessionExpired(): boolean {
    const flag = sessionStorage.getItem(SESSION_EXPIRED_KEY) === "1";
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
    return flag;
}

export function hasSessionExpiredFlag(): boolean {
    return sessionStorage.getItem(SESSION_EXPIRED_KEY) === "1";
}

export function saveRedirectPath(path: string): void {
    sessionStorage.setItem(REDIRECT_KEY, path);
}

/** Rota para voltar após o login (só caminhos internos). */
export function consumeRedirectPath(): string | null {
    const path = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    return path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/login") ? path : null;
}
