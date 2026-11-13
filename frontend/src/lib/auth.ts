import type { User } from "../types";

const TOKEN_KEY = "token";
const USER_KEY = "user";
// sessionStorage: some quando a aba fecha e não vaza entre abas/dias
const SESSION_EXPIRED_KEY = "session_expired";
const REDIRECT_KEY = "post_login_redirect";

/**
 * Evento único da sessão: disparado em login, logout, expiração e quando OUTRA aba muda o token
 * (evento `storage`). Carrinho e cabeçalho ouvem este evento para nunca mostrar dado de outra conta.
 */
export const AUTH_CHANGED_EVENT = "auth:changed";

function notifyAuthChanged(): void {
    // microtask: getToken() pode limpar a sessão durante um render, e não dá para
    // atualizar outro componente no meio do render
    queueMicrotask(() => window.dispatchEvent(new Event(AUTH_CHANGED_EVENT)));
}

/** Assina mudanças de sessão (inclui outras abas). Retorna a função de cancelar. */
export function subscribeAuth(listener: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
        // key === null: localStorage.clear() em outra aba
        if (event.key === null || event.key === TOKEN_KEY || event.key === USER_KEY) listener();
    };
    window.addEventListener(AUTH_CHANGED_EVENT, listener);
    window.addEventListener("storage", onStorage);
    return () => {
        window.removeEventListener(AUTH_CHANGED_EVENT, listener);
        window.removeEventListener("storage", onStorage);
    };
}

/** Texto estável que muda quando a sessão muda (para useSyncExternalStore). */
export function getAuthSnapshot(): string {
    return `${localStorage.getItem(TOKEN_KEY) ?? ""}|${localStorage.getItem(USER_KEY) ?? ""}`;
}

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
    notifyAuthChanged();
}

export function getAuthHeaders(): { Authorization: string } | null {
    const token = getToken();
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
}

export function clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    notifyAuthChanged();
}

/**
 * Saída da conta (única porta de logout): apaga token e usuário e avisa o app inteiro.
 * Nenhum dado de carrinho/usuário é guardado em storage; o estado em memória é zerado
 * pelos ouvintes de AUTH_CHANGED_EVENT.
 */
export function logout(): void {
    clearAuth();
    sessionStorage.removeItem(REDIRECT_KEY);
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
