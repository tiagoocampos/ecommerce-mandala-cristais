import { Payment } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import prismaClient from "../../prisma/index.js";
import { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";

interface NormalizedPaymentInfo {
    id: number;
    status: string;
    external_reference: string | null;
    payment_method_id: string | null;
}

class WebhookService {
    async execute(body: any) {
        try {
            console.log("===== WEBHOOK RECEBIDO =====");
            console.log(JSON.stringify(body, null, 2));

            const topic = body.type ?? body.topic;
            console.log("TOPIC RECEBIDO:", topic);

            let paymentInfo: NormalizedPaymentInfo | null = null;

            if (topic === "payment") {
                paymentInfo = await this.fetchFromPaymentTopic(body);
            } else if (typeof topic === "string" && topic.includes("merchant_order")) {
                // Em alguns casos a notificação de "payment" não chega — o
                // Mercado Pago sempre manda a de merchant_order também, e ela
                // carrega os pagamentos vinculados àquele pedido. Usamos isso
                // como caminho alternativo, não só como o principal.
                paymentInfo = await this.fetchFromMerchantOrderTopic(body);
            } else {
                console.log("Evento ignorado:", topic);
                return;
            }

            if (!paymentInfo) {
                console.log("Não foi possível obter dados de pagamento para este evento.");
                return;
            }

            await this.applyPaymentInfo(paymentInfo);
        } catch (error) {
            console.error("ERRO NO WEBHOOK:", error);
            throw error;
        }
    }

    private async fetchFromPaymentTopic(body: any): Promise<NormalizedPaymentInfo | null> {
        let paymentId: number;

        if (body.data?.id) {
            paymentId = Number(body.data.id);
        } else if (body.resource) {
            paymentId = Number(body.resource.split("/").pop());
        } else {
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
            status: paymentInfo.status as string,
            external_reference: paymentInfo.external_reference ?? null,
            payment_method_id: paymentInfo.payment_method_id ?? null,
        };
    }

    private async fetchFromMerchantOrderTopic(
        body: any
    ): Promise<NormalizedPaymentInfo | null> {
        const merchantOrderId = body.data?.id ?? body.id;

        if (!merchantOrderId) {
            console.log("Sem merchant_order id");
            return null;
        }

        const response = await fetch(
            `https://api.mercadopago.com/merchant_orders/${merchantOrderId}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
                },
            }
        );

        if (!response.ok) {
            console.log("Falha ao consultar merchant_order:", response.status);
            return null;
        }

        const merchantOrder = (await response.json()) as {
            external_reference?: string;
            payments?: { id: number; status: string; status_detail?: string }[];
        };

        const payments = merchantOrder.payments ?? [];
        if (payments.length === 0) {
            console.log("merchant_order sem pagamentos ainda.");
            return null;
        }

        const relevantPayment =
            payments.find((p) => p.status === "approved") ?? payments[payments.length - 1];

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

    private async applyPaymentInfo(paymentInfo: NormalizedPaymentInfo) {
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

        if (existingPayment.status === PaymentStatus.APPROVED) {
            console.log("Pagamento já estava APPROVED, ignorando reprocessamento.");
            return;
        }

        const payload = JSON.parse(JSON.stringify(paymentInfo));

        if (paymentInfo.status === "approved") {
            await prismaClient.$transaction([
                prismaClient.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.PAID },
                }),
                prismaClient.payment.update({
                    where: { order_id: orderId },
                    data: {
                        status: PaymentStatus.APPROVED,
                        provider_payment_id: String(paymentInfo.id),
                        method: paymentInfo.payment_method_id ?? null,
                        raw_payload: payload,
                    },
                }),
            ]);

            console.log("PEDIDO PAGO:", orderId);
            return;
        }

        if (paymentInfo.status === "rejected") {
            await prismaClient.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { order_id: orderId },
                    data: {
                        status: PaymentStatus.REJECTED,
                        provider_payment_id: String(paymentInfo.id),
                        method: paymentInfo.payment_method_id ?? null,
                        raw_payload: payload,
                    },
                });

                const items = await tx.orderItem.findMany({
                    where: { order_id: orderId },
                });

                for (const item of items) {
                    await tx.product.update({
                        where: { id: item.product_id },
                        data: { stock: { increment: item.quantity } },
                    });
                }

                await tx.order.update({
                    where: { id: orderId },
                    data: { status: OrderStatus.CANCELED },
                });
            });

            console.log("PAGAMENTO RECUSADO, ESTOQUE DEVOLVIDO:", orderId);
            return;
        }

        await prismaClient.payment.update({
            where: { order_id: orderId },
            data: {
                status: PaymentStatus.PENDING,
                provider_payment_id: String(paymentInfo.id),
                method: paymentInfo.payment_method_id ?? null,
                raw_payload: payload,
            },
        });

        console.log("PAGAMENTO PENDENTE:", orderId);
    }
}

export { WebhookService };