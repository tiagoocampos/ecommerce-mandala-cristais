

export class PaymentCreationError extends Error {
    public statusCode: number = 500
    constructor() {
        super("Erro ao criar o pagamento");
        this.name = "PaymentCreationError";
        Object.setPrototypeOf(this, PaymentCreationError.prototype);
    }
}