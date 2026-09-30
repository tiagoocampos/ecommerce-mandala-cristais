import prismaClient from "../prisma/index.js";

// Cliente da API Melhor Envio (OAuth2) — https://docs.melhorenvio.com.br
// Sandbox: https://sandbox.melhorenvio.com.br | Produção: https://melhorenvio.com.br
// O app é cadastrado no painel em Integrações → Área Dev. → Cadastrar Aplicativo.

const PROVIDER = "melhorenvio";

// Escopo mínimo necessário: só cotação (não emitimos etiqueta).
const SCOPES = ["shipping-calculate"];

// Renova o access_token quando faltar menos que isso para vencer (vale 30 dias).
const REFRESH_MARGIN_MS = 3 * 24 * 60 * 60 * 1000;
// O refresh_token vale 45 dias a partir da emissão.
const REFRESH_TOKEN_TTL_MS = 45 * 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

export class MelhorEnvioNotConnectedError extends Error {
    constructor(message = "Integração com o Melhor Envio não autorizada") {
        super(message);
        this.name = "MelhorEnvioNotConnectedError";
        Object.setPrototypeOf(this, MelhorEnvioNotConnectedError.prototype);
    }
}

function env() {
    const environment = process.env.MELHORENVIO_ENV === "production" ? "production" : "sandbox";
    return {
        environment,
        baseUrl: environment === "production" ? "https://melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br",
        clientId: process.env.MELHORENVIO_CLIENT_ID ?? "",
        clientSecret: process.env.MELHORENVIO_CLIENT_SECRET ?? "",
        redirectUri: process.env.MELHORENVIO_REDIRECT_URI ?? "",
        // Exigido em toda chamada: "Nome da aplicação (email@contato.com)"
        userAgent: process.env.MELHORENVIO_USER_AGENT || "Mandala Crystais",
    };
}

function baseHeaders() {
    return {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": env().userAgent,
    };
}

type TokenResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
};

// client_id é numérico na doc oficial
function clientIdValue(clientId: string) {
    return /^\d+$/.test(clientId) ? Number(clientId) : clientId;
}

async function requestToken(body: Record<string, unknown>): Promise<TokenResponse> {
    const { baseUrl, clientId, clientSecret } = env();
    if (!clientId || !clientSecret) {
        throw new MelhorEnvioNotConnectedError("MELHORENVIO_CLIENT_ID / MELHORENVIO_CLIENT_SECRET não configurados");
    }

    const response = await fetch(`${baseUrl}/oauth/token`, {
        method: "POST",
        headers: baseHeaders(),
        body: JSON.stringify({ client_id: clientIdValue(clientId), client_secret: clientSecret, ...body }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Melhor Envio /oauth/token respondeu ${response.status}: ${text.slice(0, 300)}`);
    }

    return (await response.json()) as TokenResponse;
}

async function saveToken(token: TokenResponse) {
    const now = Date.now();
    const data = {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: new Date(now + token.expires_in * 1000),
        refresh_expires_at: new Date(now + REFRESH_TOKEN_TTL_MS),
    };
    return prismaClient.integrationToken.upsert({
        where: { provider: PROVIDER },
        update: data,
        create: { provider: PROVIDER, ...data },
    });
}

/** URL para o lojista autorizar o app na conta dele do Melhor Envio. */
function getAuthorizeUrl(state: string): string {
    const { baseUrl, clientId, redirectUri } = env();
    if (!clientId || !redirectUri) {
        throw new MelhorEnvioNotConnectedError("MELHORENVIO_CLIENT_ID / MELHORENVIO_REDIRECT_URI não configurados");
    }
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        state,
        scope: SCOPES.join(" "),
    });
    return `${baseUrl}/oauth/authorize?${params.toString()}`;
}

/** Troca o `code` recebido no callback pelo primeiro access_token/refresh_token. */
async function exchangeCode(code: string) {
    const token = await requestToken({
        grant_type: "authorization_code",
        redirect_uri: env().redirectUri,
        code,
    });
    return saveToken(token);
}

// Evita dois refresh simultâneos (o refresh_token antigo deixa de valer após o primeiro).
let refreshInFlight: Promise<string> | null = null;

async function refreshAccessToken(refreshToken: string): Promise<string> {
    if (!refreshInFlight) {
        refreshInFlight = requestToken({ grant_type: "refresh_token", refresh_token: refreshToken })
            .then(async (token) => {
                await saveToken(token);
                return token.access_token;
            })
            .finally(() => {
                refreshInFlight = null;
            });
    }
    return refreshInFlight;
}

/** Garante um access_token válido, renovando via refresh_token quando estiver perto de vencer. */
async function getValidAccessToken(forceRefresh = false): Promise<string> {
    const stored = await prismaClient.integrationToken.findUnique({ where: { provider: PROVIDER } });
    if (!stored) {
        throw new MelhorEnvioNotConnectedError();
    }

    const expiresSoon = stored.expires_at.getTime() - Date.now() < REFRESH_MARGIN_MS;
    if (!forceRefresh && !expiresSoon) {
        return stored.access_token;
    }

    try {
        return await refreshAccessToken(stored.refresh_token);
    } catch (error) {
        // Refresh falhou (ex.: refresh_token vencido após 45 dias): se o access_token atual
        // ainda vale, segue com ele; senão, é preciso autorizar o app de novo no admin.
        console.error("[melhorenvio] Falha ao renovar token:", error);
        if (!forceRefresh && stored.expires_at.getTime() > Date.now()) {
            return stored.access_token;
        }
        throw new MelhorEnvioNotConnectedError("Token do Melhor Envio expirado — autorize o app novamente no admin");
    }
}

/** POST autenticado na API. Em 401, renova o token uma vez e tenta de novo. */
async function post<T>(path: string, body: unknown): Promise<T> {
    const { baseUrl } = env();

    const send = async (accessToken: string) =>
        fetch(`${baseUrl}${path}`, {
            method: "POST",
            headers: { ...baseHeaders(), Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

    let response = await send(await getValidAccessToken());
    if (response.status === 401) {
        response = await send(await getValidAccessToken(true));
    }

    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Melhor Envio ${path} respondeu ${response.status}: ${text.slice(0, 300)}`);
    }

    return (await response.json()) as T;
}

async function getStatus() {
    const { environment, clientId, redirectUri } = env();
    const stored = await prismaClient.integrationToken.findUnique({
        where: { provider: PROVIDER },
        select: { expires_at: true, refresh_expires_at: true, updatedAt: true },
    });
    return {
        environment,
        configured: !!clientId && !!redirectUri && !!process.env.MELHORENVIO_CLIENT_SECRET,
        connected: !!stored,
        expires_at: stored?.expires_at ?? null,
        refresh_expires_at: stored?.refresh_expires_at ?? null,
        updated_at: stored?.updatedAt ?? null,
    };
}

const melhorenvio = {
    getAuthorizeUrl,
    exchangeCode,
    getValidAccessToken,
    post,
    getStatus,
    originZipCode: () => process.env.STORE_ZIP_CODE ?? "",
    // Opcional: limitar serviços cotados (ex.: "1,2,17"). Vazio = todos disponíveis na conta.
    services: () => process.env.MELHORENVIO_SERVICES ?? "",
};

export { melhorenvio };
