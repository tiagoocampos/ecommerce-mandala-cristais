import prismaClient from "../../prisma/index.js";
import { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";

export interface NormalizedPaymentInfo {
    id: number;
    status: string;
    external_reference: string | null;
    payment_method_id: string | null;
    transaction_amount: number | null;
}

export type ApplyOutcome =
    // eventos descartáveis (webhook responde 200): não há o que fazer neles
    | "no_reference"
    | "order_not_found"
    | "payment_not_found"
    // reconciliação: o Mercado Pago não tem nenhum pagamento para o pedido
    | "no_mp_payment"
    // efeitos reais
    | "paid"
    | "reopened"
    | "already_approved"
    | "rejected"
    | "refunded"
    | "pending"
    // exigem ação humana
    | "manual_refund"
    | "value_mismatch";

export interface ApplyResult {
    outcome: ApplyOutcome;
    order_id: string | null;
    mp_payment_id: number;
    mp_status: string;
    order_status_before: OrderStatus | null;
    /** Em dryRun é o status que o pedido TERIA depois. */
    order_status_after: OrderStatus | null;
    manual_refund: boolean;
    message: string;
}

const DISCARDABLE: ApplyOutcome[] = ["no_reference", "order_not_found", "payment_not_found"];
export const isDiscardableOutcome = (outcome: ApplyOutcome) => DISCARDABLE.includes(outcome);

type ResultFn = (
    outcome: ApplyOutcome,
    before: OrderStatus | null,
    after: OrderStatus | null,
    message: string,
    manual_refund?: boolean
) => ApplyResult;

/**
 * Única porta de entrada para "o Mercado Pago diz que este pagamento está assim".
 * Usada pelo webhook e pela reconciliação — idempotente. Com dryRun não grava nada.
 */
export async function applyPaymentInfo(
    paymentInfo: NormalizedPaymentInfo,
    options: { dryRun?: boolean } = {}
): Promise<ApplyResult> {
    const dryRun = options.dryRun ?? false;
    const orderId = paymentInfo.external_reference;

    const result: ResultFn = (outcome, before, after, message, manual_refund = false) => ({
        outcome,
        order_id: orderId,
        mp_payment_id: paymentInfo.id,
        mp_status: paymentInfo.status,
        order_status_before: before,
        order_status_after: after,
        manual_refund,
        message,
    });

    if (!orderId) {
        return result("no_reference", null, null, "Pagamento sem external_reference.");
    }

    const order = await prismaClient.order.findUnique({ where: { id: orderId } });
    if (!order) {
        return result("order_not_found", null, null, "Pedido não encontrado.");
    }
    const before = order.status;

    const existingPayment = await prismaClient.payment.findUnique({ where: { order_id: orderId } });
    if (!existingPayment) {
        return result("payment_not_found", before, before, "Pedido sem registro de Payment.");
    }

    // Aprovação repetida (webhook duplicado): nada a fazer. Mas um pagamento aprovado
    // pode depois virar estorno/chargeback, que precisa ser registrado.
    if (existingPayment.status === PaymentStatus.APPROVED && paymentInfo.status === "approved") {
        return result("already_approved", before, before, "Pagamento já estava aprovado.");
    }
    // Já aprovado e chega um status "menor" (pending/rejected atrasado): não regride
    if (
        existingPayment.status === PaymentStatus.APPROVED &&
        !["refunded", "charged_back"].includes(paymentInfo.status)
    ) {
        return result("already_approved", before, before, `Pagamento aprovado; status atrasado "${paymentInfo.status}" ignorado.`);
    }

    const paymentData = {
        provider_payment_id: String(paymentInfo.id),
        method: paymentInfo.payment_method_id ?? null,
        raw_payload: JSON.parse(JSON.stringify(paymentInfo)),
    };

    const writePayment = async (status: PaymentStatus) => {
        if (dryRun) return;
        await prismaClient.payment.update({ where: { order_id: orderId }, data: { status, ...paymentData } });
    };

    switch (paymentInfo.status) {
        case "approved":
            return handleApproved(order, existingPayment.discount_amount, paymentInfo, paymentData, dryRun, result);

        // Recusado/cancelado/expirado NÃO cancela o pedido: no Checkout Pro o cliente pode
        // tentar de novo (outro cartão) na mesma preference. Quem encerra o pedido e
        // devolve o estoque é o job de expiração.
        case "rejected":
        case "cancelled":
        case "expired":
            await writePayment(PaymentStatus.REJECTED);
            return result("rejected", before, before, `Pagamento ${paymentInfo.status} (pedido segue pendente até expirar).`);

        // Estorno/chargeback: só registra; devolução de produto fica fora deste fluxo
        case "refunded":
        case "charged_back":
            await writePayment(PaymentStatus.REFUNDED);
            return result("refunded", before, before, `Pagamento ${paymentInfo.status}.`);

        // in_process, pending, authorized...
        default:
            await writePayment(PaymentStatus.PENDING);
            return result("pending", before, before, "Pagamento pendente.");
    }
}

async function handleApproved(
    order: { id: string; status: OrderStatus; total: number },
    pixDiscountAmount: number,
    paymentInfo: NormalizedPaymentInfo,
    paymentData: { provider_payment_id: string; method: string | null; raw_payload: any },
    dryRun: boolean,
    result: ResultFn
): Promise<ApplyResult> {
    const orderId = order.id;
    const before = order.status;
    const isPix = paymentInfo.payment_method_id === "pix";
    // Só Pix tem desconto; cartão/Checkout Pro cobra o total cheio e não é validado por valor
    const discount = isPix ? pixDiscountAmount : 0;

    if (isPix) {
        const expected = order.total - discount;
        const received = Math.round((paymentInfo.transaction_amount ?? 0) * 100);
        if (received !== expected) {
            console.error(
                `[pagamento] PIX COM VALOR DIVERGENTE no pedido ${orderId}: esperado ${expected} centavos, ` +
                    `recebido ${received}. Confira o pagamento ${paymentData.provider_payment_id} no painel do Mercado Pago.`
            );
            return result("value_mismatch", before, before, "Valor do Pix diverge do esperado; pedido NÃO foi quitado. Confira no Mercado Pago.", true);
        }
    }

    if (before !== OrderStatus.CANCELED) {
        // Só promove de PENDING para PAID: um webhook duplicado não faz um pedido
        // SHIPPED/DELIVERED voltar para PAID. O desconto do Pix é consolidado no total aqui.
        const after = before === OrderStatus.PENDING ? OrderStatus.PAID : before;
        if (!dryRun) {
            await prismaClient.$transaction(async (tx) => {
                const promoted = await tx.order.updateMany({
                    where: { id: orderId, status: OrderStatus.PENDING },
                    data: { status: OrderStatus.PAID, total: { decrement: discount } },
                });
                await tx.payment.update({
                    where: { order_id: orderId },
                    data: {
                        status: PaymentStatus.APPROVED,
                        ...paymentData,
                        discount_amount: promoted.count > 0 ? discount : 0,
                    },
                });
            });
            console.log("[pagamento] pedido pago:", orderId);
        }
        return result("paid", before, after, "Pagamento aprovado; pedido confirmado.");
    }

    // APROVAÇÃO TARDIA: o pedido já foi cancelado (expirou) e o estoque devolvido, mas o
    // pagamento foi aprovado. Tenta reservar de novo, com a mesma regra atômica do checkout.
    if (dryRun) {
        const items = await prismaClient.orderItem.findMany({
            where: { order_id: orderId },
            include: { product: { select: { stock: true } } },
        });
        const hasStock = items.every((item) => item.product.stock >= item.quantity);
        return hasStock
            ? result("reopened", before, OrderStatus.PAID, "Aprovação tardia: pedido seria reaberto e estoque reservado.")
            : result("manual_refund", before, before, "REEMBOLSO MANUAL NECESSÁRIO: pedido cancelado, pagamento aprovado e sem estoque.", true);
    }

    try {
        await prismaClient.$transaction(async (tx) => {
            const items = await tx.orderItem.findMany({ where: { order_id: orderId } });
            for (const item of items) {
                const reserved = await tx.product.updateMany({
                    where: { id: item.product_id, stock: { gte: item.quantity } },
                    data: { stock: { decrement: item.quantity } },
                });
                if (reserved.count === 0) {
                    throw new Error(`sem estoque para o produto ${item.product_id}`);
                }
            }
            const reopened = await tx.order.updateMany({
                where: { id: orderId, status: OrderStatus.CANCELED },
                data: { status: OrderStatus.PAID, total: { decrement: discount } },
            });
            if (reopened.count === 0) {
                throw new Error("status do pedido mudou durante o processamento");
            }
            await tx.payment.update({
                where: { order_id: orderId },
                data: { status: PaymentStatus.APPROVED, ...paymentData, discount_amount: discount },
            });
        });
        console.log("[pagamento] aprovação tardia: estoque reservado de novo, pedido pago:", orderId);
        return result("reopened", before, OrderStatus.PAID, "Aprovação tardia: pedido reaberto e confirmado.");
    } catch (error) {
        // Sem estoque: pedido continua CANCELED, pagamento fica registrado como APPROVED
        // e o admin precisa ESTORNAR manualmente no painel do Mercado Pago.
        await prismaClient.payment.update({
            where: { order_id: orderId },
            data: { status: PaymentStatus.APPROVED, ...paymentData },
        });
        console.error(
            `[REEMBOLSO MANUAL NECESSÁRIO] Pedido ${orderId}: pagamento APROVADO depois do pedido ser cancelado/expirar, ` +
                `e não há estoque para reabrir (${error instanceof Error ? error.message : error}). ` +
                `Estorne o pagamento ${paymentData.provider_payment_id} no painel do Mercado Pago.`
        );
        return result("manual_refund", before, before, "REEMBOLSO MANUAL NECESSÁRIO: pagamento aprovado após o pedido ser cancelado e sem estoque para reabrir. Estorne no painel do Mercado Pago.", true);
    }
}
