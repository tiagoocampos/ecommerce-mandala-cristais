import { createHash, randomBytes } from "node:crypto";

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

/** Token em texto puro (vai só no link do e-mail) + hash sha256 (o único que fica no banco). */
export function generateResetToken() {
    const token = randomBytes(32).toString("hex");
    return { token, tokenHash: hashResetToken(token) };
}

export function hashResetToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}
