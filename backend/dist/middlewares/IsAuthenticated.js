import jwt from "jsonwebtoken";
import { InvalidToken } from "../exceptions/InvalidToken.js";
import prismaClient from "../prisma/index.js";
import { signUserToken } from "../utils/authToken.js";
// Evita que requisições simultâneas com o MESMO token velho consultem o banco e emitam
// vários tokens novos: no máximo uma renovação por usuário a cada 60 s por processo.
const RENEW_COOLDOWN_MS = 60_000;
const lastRenewal = new Map();
/** Verdadeiro quando o token já passou de metade da vida. */
export function shouldRenew(payload, nowMs = Date.now()) {
    if (!payload.iat || !payload.exp)
        return false;
    const halfLife = (payload.iat + payload.exp) / 2;
    return nowMs / 1000 >= halfLife;
}
export async function isAuthenticated(req, res, next) {
    const authToken = req.headers.authorization;
    if (!authToken) {
        throw new InvalidToken("TOKEN_MISSING");
    }
    const [, token] = authToken.split(" ");
    if (!token) {
        throw new InvalidToken("TOKEN_MISSING");
    }
    let payload;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (typeof decoded === "string" || !decoded.sub) {
            throw new jwt.JsonWebTokenError("jwt malformed");
        }
        payload = decoded;
    }
    catch (error) {
        // Loga só o MOTIVO (jwt expired / invalid signature / jwt malformed), nunca o token.
        // "invalid signature" em massa = JWT_SECRET diferente do que assinou os tokens.
        const reason = error instanceof Error ? error.message : "erro desconhecido";
        console.warn(`[auth] token recusado: ${reason}`);
        throw new InvalidToken(error instanceof jwt.TokenExpiredError ? "TOKEN_EXPIRED" : "TOKEN_INVALID");
    }
    req.user_id = payload.sub;
    // Renovação deslizante: devolve um token novo em X-New-Token (nunca derruba a requisição)
    if (shouldRenew(payload)) {
        const now = Date.now();
        const last = lastRenewal.get(req.user_id);
        if (last === undefined || now - last >= RENEW_COOLDOWN_MS) {
            lastRenewal.set(req.user_id, now);
            try {
                // só consulta o banco quando vai renovar: não emite token para usuário apagado
                const user = await prismaClient.user.findUnique({
                    where: { id: req.user_id },
                    select: { id: true, name: true, email: true },
                });
                if (user) {
                    res.setHeader("X-New-Token", signUserToken(user));
                }
            }
            catch (error) {
                console.warn("[auth] não foi possível renovar o token:", error instanceof Error ? error.message : "erro");
            }
        }
    }
    return next();
}
//# sourceMappingURL=IsAuthenticated.js.map