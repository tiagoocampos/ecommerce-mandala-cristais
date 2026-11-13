import { Payment } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import { ApplyResult, applyPaymentInfo } from "./applyPaymentInfo.js";
import { normalizePayment } from "./WebhookService.js";

/**
 * Reconciliação: a fonte de verdade é a API do Mercado Pago. Busca os pagamentos do pedido
 * pelo external_reference, escolhe o relevante (aprovado mais recente; senão o mais recente)
 * e o passa por applyPaymentInfo — a mesma lógica (idempotente) do webhook.
 * Erros de rede/API sobem para o chamador decidir.
 */
export async function reconcileOrderPayment(
    order_id: string,
    options: { dryRun?: boolean } = {}
): Promise<ApplyResult> {
    const search = await new Payment(client).search({
        options: {
            external_reference: order_id,
            sort: "date_created",
            criteria: "desc",
            limit: 30,
        },
    });

    const results = search.results ?? [];
    if (results.length === 0) {
        return {
            outcome: "no_mp_payment",
            order_id,
            mp_payment_id: 0,
            mp_status: "none",
            order_status_before: null,
            order_status_after: null,
            manual_refund: false,
            message: "O Mercado Pago não tem nenhum pagamento para este pedido.",
        };
    }

    // já vem do mais recente para o mais antigo
    const relevant = results.find((p) => p.status === "approved") ?? results[0]!;
    // garante o vínculo mesmo se o campo vier vazio no resumo da busca
    const info = normalizePayment({ ...relevant, external_reference: relevant.external_reference ?? order_id });
    return applyPaymentInfo(info, options);
}

// ---- gatilho barato (sem timer): no máximo 1 reconciliação por pedido a cada 60 s ----
const THROTTLE_MS = 60_000;
const lastRun = new Map<string, number>();

/** Fire-and-forget: nunca lança e nunca atrasa a resposta ao cliente. */
export function maybeReconcileOrderPayment(order_id: string): void {
    const now = Date.now();
    const last = lastRun.get(order_id);
    if (last !== undefined && now - last < THROTTLE_MS) return;

    // limpeza simples para o mapa não crescer para sempre
    if (lastRun.size > 500) {
        for (const [id, ts] of lastRun) if (now - ts >= THROTTLE_MS) lastRun.delete(id);
    }
    lastRun.set(order_id, now);

    reconcileOrderPayment(order_id).catch((error) => {
        console.error("[reconciliação] falha ao reconciliar", order_id, error instanceof Error ? error.message : "erro");
    });
}
