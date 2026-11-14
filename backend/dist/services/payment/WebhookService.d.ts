import { NormalizedPaymentInfo } from "./applyPaymentInfo.js";
/** Resultado do webhook: handled=false = descartado (não adianta o Mercado Pago repetir). */
export type WebhookResult = {
    handled: boolean;
    reason: string;
};
export declare function mpErrorStatus(error: unknown): number | null;
export declare function normalizePayment(info: {
    id?: number | string;
    status?: string;
    external_reference?: string | null;
    payment_method_id?: string | null;
    transaction_amount?: number | null;
}): NormalizedPaymentInfo;
/**
 * Transitório (banco fora, rede, 5xx do Mercado Pago, token inválido) → a exceção sobe e o
 * controller responde 5xx, então o Mercado Pago repete. Descartável (tópico não tratado,
 * pagamento 404 — inclui as notificações de teste do painel —, pedido inexistente...) →
 * retorna normalmente e o controller responde 200.
 */
declare class WebhookService {
    execute(body: any): Promise<WebhookResult>;
    private discard;
    private fetchFromPaymentTopic;
    private fetchPaymentById;
    private fetchFromMerchantOrderTopic;
}
export { WebhookService };
//# sourceMappingURL=WebhookService.d.ts.map