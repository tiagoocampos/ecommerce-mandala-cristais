export class EmailUnavailableError extends Error {
    public statusCode: number = 503
    constructor(message = "O envio de e-mails não está configurado no servidor (BREVO_API_KEY / BREVO_SENDER_EMAIL).") {
        super(message);
        this.name = "EmailUnavailableError";
        Object.setPrototypeOf(this, EmailUnavailableError.prototype);
    }
}

export class InvalidResetTokenError extends Error {
    public statusCode: number = 400
    constructor() {
        super("Link inválido ou expirado. Solicite um novo.");
        this.name = "InvalidResetTokenError";
        Object.setPrototypeOf(this, InvalidResetTokenError.prototype);
    }
}

export class InvalidUnsubscribeTokenError extends Error {
    public statusCode: number = 400
    constructor() {
        super("Link de descadastro inválido.");
        this.name = "InvalidUnsubscribeTokenError";
        Object.setPrototypeOf(this, InvalidUnsubscribeTokenError.prototype);
    }
}

export class NoRecipientsError extends Error {
    public statusCode: number = 400
    constructor() {
        super("Nenhum destinatário válido: os clientes selecionados não existem ou pediram para não receber ofertas.");
        this.name = "NoRecipientsError";
        Object.setPrototypeOf(this, NoRecipientsError.prototype);
    }
}
