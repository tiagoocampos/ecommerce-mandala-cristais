export class AIAssistUnavailableError extends Error {
    public statusCode: number = 503
    constructor(message = "A IA está indisponível agora. Tente de novo em instantes ou preencha manualmente.") {
        super(message);
        this.name = "AIAssistUnavailableError";
        Object.setPrototypeOf(this, AIAssistUnavailableError.prototype);
    }
}

export class AIInvalidResponseError extends Error {
    public statusCode: number = 502
    constructor() {
        super("A IA retornou uma resposta em formato inesperado. Tente de novo ou preencha manualmente.");
        this.name = "AIInvalidResponseError";
        Object.setPrototypeOf(this, AIInvalidResponseError.prototype);
    }
}
