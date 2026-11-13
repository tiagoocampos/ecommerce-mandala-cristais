

export class PaymentCreationError extends Error {
    public statusCode: number = 500
    constructor() {
        super("Erro ao criar o pagamento");
        this.name = "PaymentCreationError";
        Object.setPrototypeOf(this, PaymentCreationError.prototype);
    }
}

export class PaymentSyncError extends Error {
    public statusCode: number = 503
    constructor() {
        super("Não conseguimos consultar o pagamento agora. Tente novamente em instantes.");
        this.name = "PaymentSyncError";
        Object.setPrototypeOf(this, PaymentSyncError.prototype);
    }
}
