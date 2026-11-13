export type TokenErrorCode = "TOKEN_EXPIRED" | "TOKEN_INVALID" | "TOKEN_MISSING";

const MESSAGES: Record<TokenErrorCode, string> = {
    TOKEN_EXPIRED: "Sua sessão expirou. Faça login novamente.",
    TOKEN_INVALID: "Token inválido",
    TOKEN_MISSING: "Token inválido",
};

export class InvalidToken extends Error {
    public statusCode: number = 401
    public code: TokenErrorCode
    constructor(code: TokenErrorCode = "TOKEN_INVALID") {
        super(MESSAGES[code]);
        this.name = "InvalidToken";
        this.code = code;
        Object.setPrototypeOf(this, InvalidToken.prototype);
    }
}
