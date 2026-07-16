export class UserNotFoundError extends Error {
    public statusCode: number = 404
    constructor() {
        super("Usuário não encontrado");
        this.name = "UserNotFoundError";
        Object.setPrototypeOf(this, UserNotFoundError.prototype);
    }
}

export class UnauthorizedUserError extends Error {
    public statusCode: number = 401
    constructor() {
        super("Usuário nao autorizado");
        this.name = "UnauthorizedUserError";
        Object.setPrototypeOf(this, UnauthorizedUserError.prototype);
    }
}

export class ForbiddenError extends Error{
    public statusCode: number = 403
    constructor() {
        super("Acesso negado");
        this.name = "ForbiddenError";
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}