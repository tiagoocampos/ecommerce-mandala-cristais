export class InvalidToken extends Error {
    statusCode = 401;
    constructor() {
        super("Token inválido");
        this.name = "InvalidToken";
        Object.setPrototypeOf(this, InvalidToken.prototype);
    }
}
//# sourceMappingURL=InvalidToken.js.map