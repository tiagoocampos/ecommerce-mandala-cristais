export class ShippingUnavailableError extends Error {
    public statusCode: number = 503
    constructor(message = "Não conseguimos calcular o frete agora. Tente novamente em instantes.") {
        super(message);
        this.name = "ShippingUnavailableError";
        Object.setPrototypeOf(this, ShippingUnavailableError.prototype);
    }
}

export class ShippingServiceNotAvailableError extends Error {
    public statusCode: number = 409
    constructor() {
        super("A opção de frete escolhida não está mais disponível. Recalcule o frete e escolha novamente.");
        this.name = "ShippingServiceNotAvailableError";
        Object.setPrototypeOf(this, ShippingServiceNotAvailableError.prototype);
    }
}

export class NoShippingOptionsError extends Error {
    public statusCode: number = 422
    constructor() {
        super("Não há opções de entrega disponíveis para este CEP. Confira o endereço ou fale com a gente pelo WhatsApp.");
        this.name = "NoShippingOptionsError";
        Object.setPrototypeOf(this, NoShippingOptionsError.prototype);
    }
}

export class InvalidZipCodeError extends Error {
    public statusCode: number = 400
    constructor() {
        super("CEP do endereço inválido. Confira o endereço de entrega.");
        this.name = "InvalidZipCodeError";
        Object.setPrototypeOf(this, InvalidZipCodeError.prototype);
    }
}

export class InvalidOAuthStateError extends Error {
    public statusCode: number = 400
    constructor() {
        super("Link de autorização inválido ou expirado. Gere um novo no painel admin.");
        this.name = "InvalidOAuthStateError";
        Object.setPrototypeOf(this, InvalidOAuthStateError.prototype);
    }
}


export class ShippingServiceUnavailableError extends Error {
    public statusCode: number = 409
    constructor(service: string) {
        super(`${service} está indisponível para este endereço/pedido. Escolha outra opção de entrega.`);
        this.name = "ShippingServiceUnavailableError";
        Object.setPrototypeOf(this, ShippingServiceUnavailableError.prototype);
    }
}

export class PickupNotAvailableError extends Error {
    public statusCode: number = 422
    constructor() {
        super("A retirada na loja não está disponível no momento. Escolha a entrega no seu endereço.");
        this.name = "PickupNotAvailableError";
        Object.setPrototypeOf(this, PickupNotAvailableError.prototype);
    }
}
