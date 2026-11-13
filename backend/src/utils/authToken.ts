import jwt from "jsonwebtoken";

/** Duração do login (JWT_EXPIRES_IN, ex.: "60d", "12h"). Padrão 60d. */
export function jwtExpiresIn(): string {
    const raw = (process.env.JWT_EXPIRES_IN ?? "").trim();
    return /^\d+(ms|s|m|h|d|w|y)?$/i.test(raw) && raw !== "0" ? raw : "60d";
}

/** Mesmo payload no login e na renovação: { name, email } com sub = id do usuário. */
export function signUserToken(user: { id: string; name: string; email: string }): string {
    return jwt.sign({ name: user.name, email: user.email }, process.env.JWT_SECRET as string, {
        subject: user.id,
        expiresIn: jwtExpiresIn() as NonNullable<jwt.SignOptions["expiresIn"]>,
    });
}
