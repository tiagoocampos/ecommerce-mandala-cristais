import { Payment } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import { applyPaymentInfo, isDiscardableOutcome } from "./applyPaymentInfo.js";
// Erro do SDK do Mercado Pago: o corpo da resposta é lançado, com `status` HTTP
export function mpErrorStatus(error) {
    const status = error?.status;
    return typeof status === "number" ? status : null;
}
export function normalizePayment(info) {
    return {
        id: Number(info.id),
        status: info.status,
        external_reference: info.external_reference ?? null,
        payment_method_id: info.payment_method_id ?? null,
        transaction_amount: info.transaction_amount ?? null,
    };
}
/**
 * Transitório (banco fora, rede, 5xx do Mercado Pago, token inválido) → a exceção sobe e o
 * controller responde 5xx, então o Mercado Pago repete. Descartável (tópico não tratado,
 * pagamento 404 — inclui as notificações de teste do painel —, pedido inexistente...) →
 * retorna normalmente e o controller responde 200.
 */
class WebhookService {
    async execute(body) {
        const topic = body?.type ?? body?.topic;
        const dataId = body?.data?.id ?? null;
        let paymentInfo;
        if (topic === "payment") {
            paymentInfo = await this.fetchFromPaymentTopic(body);
        }
        else if (typeof topic === "string" && topic.includes("merchant_order")) {
            // Caminho alternativo: a notificação de merchant_order carrega os pagamentos do pedido
            paymentInfo = await this.fetchFromMerchantOrderTopic(body);
        }
        else {
            return this.discard(`tópico não tratado (${String(topic)})`);
        }
        if (!paymentInfo) {
            return this.discard(`sem dados de pagamento (tópico=${String(topic)}, id=${dataId})`);
        }
        const applied = await applyPaymentInfo(paymentInfo);
        console.log(`[webhook] tópico=${String(topic)} pagamento=${paymentInfo.id} status=${paymentInfo.status} ` +
            `pedido=${paymentInfo.external_reference ?? "-"} resultado=${applied.outcome}`);
        if (isDiscardableOutcome(applied.outcome)) {
            return { handled: false, reason: applied.message };
        }
        return { handled: true, reason: applied.outcome };
    }
    discard(reason) {
        console.log(`[webhook] descartado: ${reason}`);
        return { handled: false, reason };
    }
    async fetchFromPaymentTopic(body) {
        let paymentId;
        if (body.data?.id) {
            paymentId = Number(body.data.id);
        }
        else if (typeof body.resource === "string") {
            paymentId = Number(body.resource.split("/").pop());
        }
        else {
            return null;
        }
        if (!paymentId || Number.isNaN(paymentId)) {
            return null;
        }
        return this.fetchPaymentById(paymentId);
    }
    // Sempre busca o pagamento completo: precisa do valor e da forma de pagamento.
    // 404 (inclui o id fictício das notificações de teste) = descartável → null.
    async fetchPaymentById(paymentId) {
        try {
            return normalizePayment(await new Payment(client).get({ id: paymentId }));
        }
        catch (error) {
            if (mpErrorStatus(error) === 404)
                return null;
            throw error;
        }
    }
    async fetchFromMerchantOrderTopic(body) {
        const merchantOrderId = body.data?.id ?? body.id;
        if (!merchantOrderId) {
            return null;
        }
        const response = await fetch(`https://api.mercadopago.com/merchant_orders/${encodeURIComponent(String(merchantOrderId))}`, {
            headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
        });
        if (response.status === 404)
            return null;
        if (!response.ok) {
            // 401/5xx...: transitório ou de configuração → 5xx para o Mercado Pago repetir
            throw new Error(`merchant_orders respondeu ${response.status}`);
        }
        const merchantOrder = (await response.json());
        const payments = merchantOrder.payments ?? [];
        const relevantPayment = payments.find((p) => p.status === "approved") ?? payments[payments.length - 1];
        if (!relevantPayment) {
            return null;
        }
        const full = await this.fetchPaymentById(relevantPayment.id);
        if (!full)
            return null;
        return { ...full, external_reference: full.external_reference ?? merchantOrder.external_reference ?? null };
    }
}
export { WebhookService };
//# sourceMappingURL=WebhookService.js.map