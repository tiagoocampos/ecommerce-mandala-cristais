// password not correct in authUser
export class PasswordNotMatchError extends Error {
    statusCode = 401;
    constructor() {
        super("Senha incorreta");
        this.name = "PasswordNotMatchError";
        Object.setPrototypeOf(this, PasswordNotMatchError.prototype);
    }
}
//# sourceMappingURL=passwordNotMatch.js.map