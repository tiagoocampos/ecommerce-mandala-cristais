export class PaymentCreationError extends Error {
    statusCode = 500;
    constructor() {
        super("Erro ao criar o pagamento");
        this.name = "PaymentCreationError";
        Object.setPrototypeOf(this, PaymentCreationError.prototype);
    }
}
export class PaymentSyncError extends Error {
    statusCode = 503;
    constructor() {
        super("Não conseguimos consultar o pagamento agora. Tente novamente em instantes.");
        this.name = "PaymentSyncError";
        Object.setPrototypeOf(this, PaymentSyncError.prototype);
    }
}
//# sourceMappingURL=PaymentErrors.js.map