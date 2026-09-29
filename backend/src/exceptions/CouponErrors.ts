export class InvalidCouponError extends Error {
    public statusCode: number = 400
    constructor(message = "Cupom inválido") {
        super(message);
        this.name = "InvalidCouponError";
        Object.setPrototypeOf(this, InvalidCouponError.prototype);
    }
}

export class CouponAlreadyExistsError extends Error {
    public statusCode: number = 409
    constructor() {
        super("Já existe um cupom com esse código");
        this.name = "CouponAlreadyExistsError";
        Object.setPrototypeOf(this, CouponAlreadyExistsError.prototype);
    }
}

export class CouponNotFoundError extends Error {
    public statusCode: number = 404
    constructor() {
        super("Cupom não encontrado");
        this.name = "CouponNotFoundError";
        Object.setPrototypeOf(this, CouponNotFoundError.prototype);
    }
}
