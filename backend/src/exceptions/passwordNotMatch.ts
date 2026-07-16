// password not correct in authUser
export class PasswordNotMatchError extends Error {
    public statusCode: number = 401;
    constructor() {
        super("Senha incorreta");
        this.name = "PasswordNotMatchError";
        Object.setPrototypeOf(this, PasswordNotMatchError.prototype);
    }
}