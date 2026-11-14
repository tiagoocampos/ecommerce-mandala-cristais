const MESSAGES = {
    TOKEN_EXPIRED: "Sua sessão expirou. Faça login novamente.",
    TOKEN_INVALID: "Token inválido",
    TOKEN_MISSING: "Token inválido",
};
export class InvalidToken extends Error {
    statusCode = 401;
    code;
    constructor(code = "TOKEN_INVALID") {
        super(MESSAGES[code]);
        this.name = "InvalidToken";
        this.code = code;
        Object.setPrototypeOf(this, InvalidToken.prototype);
    }
}
//# sourceMappingURL=InvalidToken.js.map