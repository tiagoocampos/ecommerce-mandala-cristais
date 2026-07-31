export class PaymentCreationError extends Error {
    statusCode = 500;
    constructor() {
        super("Erro ao criar o pagamento");
        this.name = "PaymentCreationError";
        Object.setPrototypeOf(this, PaymentCreationError.prototype);
    }
}
//# sourceMappingURL=PaymentErrors.js.map