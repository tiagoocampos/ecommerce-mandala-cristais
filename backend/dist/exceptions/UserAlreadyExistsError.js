export class UserAlreadyExistsError extends Error {
    statusCode;
    constructor() {
        super("Usuário já cadastrado");
        this.name = "UserAlreadyExistsError";
        this.statusCode = 400;
        Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
    }
}
//# sourceMappingURL=UserAlreadyExistsError.js.map