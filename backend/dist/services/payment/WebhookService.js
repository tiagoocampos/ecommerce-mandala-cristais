import { Payment } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import prismaClient from "../../prisma/index.js";
import { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";
class WebhookService {
    async execute(body) {
        try {
            console.log("===== WEBHOOK RECEBIDO =====");
            console.log(JSON.stringify(body, null, 2));
            const topic = body.type ?? body.topic;
            console.log("TOPIC RECEBIDO:", topic);
            let paymentInfo = null;
            if (topic === "payment") {
                paymentInfo = await this.fetchFromPaymentTopic(body);
            }
            else if (typeof topic === "string" && topic.includes("merchant_order")) {
                // Em alguns casos a notificação de "payment" não chega — o
                // Mercado Pago sempre manda a de merchant_order também, e ela
                // carrega os pagamentos vinculados àquele pedido. Usamos isso
                // como caminho alternativo, não só como o principal.
                paymentInfo = await this.fetchFromMerchantOrderTopic(body);
            }
            else {
                console.log("Evento ignorado:", topic);
                return;
            }
            if (!paymentInfo) {
                console.log("Não foi possível obter dados de pagamento para este evento.");
                return;
            }
            await this.applyPaymentInfo(paymentInfo);
        }
        catch (error) {
            console.error("ERRO NO WEBHOOK:", error);
            throw error;
        }
    }
    async fetchFromPaymentTopic(body) {
        let paymentId;
        if (body.data?.id) {
            paymentId = Number(body.data.id);
        }
        else if (body.resource) {
            paymentId = Number(body.resource.split("/").pop());
        }
        else {
            console.log("Sem payment id");
            return null;
        }
        if (!paymentId || Number.isNaN(paymentId)) {
            console.log("Payment ID inválido:", paymentId);
            return null;
        }
        const payment = new Payment(client);
        const paymentInfo = await payment.get({ id: paymentId });
        return {
            id: Number(paymentInfo.id),
            status: paymentInfo.status,
            external_reference: paymentInfo.external_reference ?? null,
            payment_method_id: paymentInfo.payment_method_id ?? null,
        };
    }
    async fetchFromMerchantOrderTopic(body) {
        const merchantOrderId = body.data?.id ?? body.id;
        if (!merchantOrderId) {
            console.log("Sem merchant_order id");
            return null;
        }
        const response = await fetch(`https://api.mercadopago.com/merchant_orders/${merchantOrderId}`, {
            headers: {
                Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            },
        });
        if (!response.ok) {
            console.log("Falha ao consultar merchant_order:", response.status);
            return null;
        }
        const merchantOrder = (await response.json());
        const payments = merchantOrder.payments ?? [];
        if (payments.length === 0) {
            console.log("merchant_order sem pagamentos ainda.");
            return null;
        }
        const relevantPayment = payments.find((p) => p.status === "approved") ?? payments[payments.length - 1];
        if (!relevantPayment) {
            console.log("Não foi possível determinar o pagamento relevante.");
            return null;
        }
        return {
            id: relevantPayment.id,
            status: relevantPayment.status,
            external_reference: merchantOrder.external_reference ?? null,
            payment_method_id: null,
        };
    }
    async applyPaymentInfo(paymentInfo) {
        console.log("===== DADOS PAGAMENTO NORMALIZADOS =====");
        console.log(paymentInfo);
        const orderId = paymentInfo.external_reference;
        if (!orderId) {
            console.log("Sem external_reference");
            return;
        }
        const order = await prismaClient.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            console.log("PEDIDO NÃO ENCONTRADO:", orderId);
            return;
        }
        const existingPayment = await prismaClient.payment.findUnique({
            where: { order_id: orderId },
        });
        if (!existingPayment) {
            console.log("PAYMENT NÃO ENCONTRADO PARA ORDER:", orderId);
            return;
        }
        // Aprovação repetida (webhook duplicado): nada a fazer. Mas um pagamento aprovado
        // pode depois virar estorno/chargeback, que precisa ser registrado.
        if (existingPayment.status === PaymentStatus.APPROVED && paymentInfo.status === "approved") {
            console.log("Pagamento já estava APPROVED, ignorando reprocessamento.");
            return;
        }
        // Já aprovado e chega um status "menor" (pending/rejected atrasado): não regride
        if (existingPayment.status === PaymentStatus.APPROVED &&
            !["refunded", "charged_back"].includes(paymentInfo.status)) {
            console.log(`Pagamento APPROVED; ignorando status atrasado "${paymentInfo.status}".`);
            return;
        }
        const payload = JSON.parse(JSON.stringify(paymentInfo));
        const paymentData = {
            provider_payment_id: String(paymentInfo.id),
            method: paymentInfo.payment_method_id ?? null,
            raw_payload: payload,
        };
        switch (paymentInfo.status) {
            case "approved":
                await this.handleApproved(orderId, order.status, paymentData);
                return;
            // Recusado/cancelado/expirado NÃO cancela o pedido: no Checkout Pro o cliente pode
            // tentar de novo (outro cartão) na mesma preference. Quem encerra o pedido e
            // devolve o estoque é o job de expiração.
            case "rejected":
            case "cancelled":
            case "expired":
                await prismaClient.payment.update({
                    where: { order_id: orderId },
                    data: { status: PaymentStatus.REJECTED, ...paymentData },
                });
                console.log(`PAGAMENTO ${paymentInfo.status.toUpperCase()} (pedido segue pendente até expirar):`, orderId);
                return;
            // Estorno/chargeback: só registra; devolução de produto fica fora deste fluxo
            case "refunded":
            case "charged_back":
                await prismaClient.payment.update({
                    where: { order_id: orderId },
                    data: { status: PaymentStatus.REFUNDED, ...paymentData },
                });
                console.log(`PAGAMENTO ${paymentInfo.status.toUpperCase()}:`, orderId);
                return;
            // in_process, pending, authorized...
            default:
                await prismaClient.payment.update({
                    where: { order_id: orderId },
                    data: { status: PaymentStatus.PENDING, ...paymentData },
                });
                console.log("PAGAMENTO PENDENTE:", orderId);
        }
    }
    async handleApproved(orderId, orderStatus, paymentData) {
        if (orderStatus !== OrderStatus.CANCELED) {
            // Só promove de PENDING para PAID: um webhook duplicado não faz um pedido
            // SHIPPED/DELIVERED voltar para PAID
            await prismaClient.$transaction([
                prismaClient.order.updateMany({
                    where: { id: orderId, status: OrderStatus.PENDING },
                    data: { status: OrderStatus.PAID },
                }),
                prismaClient.payment.update({
                    where: { order_id: orderId },
                    data: { status: PaymentStatus.APPROVED, ...paymentData },
                }),
            ]);
            console.log("PEDIDO PAGO:", orderId);
            return;
        }
        // APROVAÇÃO TARDIA: o pedido já foi cancelado (expirou) e o estoque devolvido, mas o
        // pagamento foi aprovado. Tenta reservar de novo, com a mesma regra atômica do checkout.
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
                    data: { status: OrderStatus.PAID },
                });
                if (reopened.count === 0) {
                    throw new Error("status do pedido mudou durante o processamento");
                }
                await tx.payment.update({
                    where: { order_id: orderId },
                    data: { status: PaymentStatus.APPROVED, ...paymentData },
                });
            });
            console.log("APROVAÇÃO TARDIA: estoque reservado de novo, PEDIDO PAGO:", orderId);
        }
        catch (error) {
            // Sem estoque: pedido continua CANCELED, pagamento fica registrado como APPROVED
            // e o admin precisa ESTORNAR manualmente no painel do Mercado Pago.
            await prismaClient.payment.update({
                where: { order_id: orderId },
                data: { status: PaymentStatus.APPROVED, ...paymentData },
            });
            console.error(`🚨 [REEMBOLSO MANUAL NECESSÁRIO] Pedido ${orderId}: pagamento APROVADO depois do pedido ser cancelado/expirar, ` +
                `e não há estoque para reabrir (${error instanceof Error ? error.message : error}). ` +
                `Estorne o pagamento ${paymentData.provider_payment_id} no painel do Mercado Pago.`);
        }
    }
}
export { WebhookService };
//# sourceMappingURL=WebhookService.js.map