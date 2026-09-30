import { createHmac, timingSafeEqual } from "node:crypto";

// Token do link de descadastro: "<id do usuário>.<assinatura HMAC>".
// Sem coluna extra no banco e sem expiração (o link de um e-mail antigo continua valendo).
// Segredo derivado do JWT_SECRET, para não servir como token de login.
function secret() {
    return `${process.env.JWT_SECRET as string}:marketing-unsubscribe`;
}

function sign(userId: string): string {
    return createHmac("sha256", secret()).update(userId).digest("base64url");
}

export function createUnsubscribeToken(userId: string): string {
    return `${userId}.${sign(userId)}`;
}

/** Devolve o id do usuário se o token for válido; senão, null. */
export function readUnsubscribeToken(token: string): string | null {
    const separator = token.lastIndexOf(".");
    if (separator <= 0) return null;
    const userId = token.slice(0, separator);
    const given = Buffer.from(token.slice(separator + 1));
    const expected = Buffer.from(sign(userId));
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    return userId;
}
