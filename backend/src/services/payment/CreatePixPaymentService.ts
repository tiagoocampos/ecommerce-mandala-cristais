import { Payment } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import { calculatePixDiscount, pixExpirationMinutes } from "../../config/pix.js";
import prismaClient from "../../prisma/index.js";
import { OrderNotFoundError, OrderNotPayableError } from "../../exceptions/OrdersErrors.js";
import { PaymentCreationError } from "../../exceptions/PaymentErrors.js";
import { toMercadoPagoDate } from "../../utils/orderExpiration.js";
import { cancelOrderAndRestoreStock } from "../order/CancelOrderAndRestoreStockService.js";

interface CreatePixPaymentServiceProps {
    order_id: string;
    user_id: string;
}

// Valor em reais com 2 casas, a partir de centavos inteiros
const toReais = (cents: number) => Math.round(cents) / 100;

class CreatePixPaymentService {
    async execute({ order_id, user_id }: CreatePixPaymentServiceProps) {
        const order = await prismaClient.order.findFirst({
            where: { id: order_id, user_id },
            include: { payment: true },
        });

        if (!order) {
            throw new OrderNotFoundError();
        }
        if (order.status !== "PENDING") {
            throw new OrderNotPayableError();
        }
        if (order.expires_at && order.expires_at.getTime() <= Date.now()) {
            // Vencido: cancela e devolve o estoque agora (idempotente), depois responde "expirado"
            await cancelOrderAndRestoreStock(order.id, { onlyPending: true });
            throw new OrderNotPayableError("O prazo para pagar este pedido expirou. Faça um novo pedido.");
        }

        // Valor sempre calculado aqui; o frontend não envia nada de preço
        const pixDiscount = calculatePixDiscount(order);
        const amountToPay = order.total - pixDiscount;
        const mpPayment = new Payment(client);

        // Reaproveita o Pix pendente e ainda válido em vez de criar outro
        const current = order.payment;
        if (current?.method === "pix" && current.provider_payment_id) {
            try {
                const existing = await mpPayment.get({ id: current.provider_payment_id });
                const expiresAt = existing.date_of_expiration ? new Date(existing.date_of_expiration) : null;
                if (existing.status === "approved") {
                    throw new OrderNotPayableError("O pagamento deste pedido já foi aprovado e está sendo confirmado.");
                }
                if (existing.status === "pending" && expiresAt && expiresAt.getTime() > Date.now()) {
                    const data = existing.point_of_interaction?.transaction_data;
                    if (data?.qr_code && data.qr_code_base64) {
                        return {
                            order_id: order.id,
                            payment_id: String(existing.id),
                            original_total: order.total,
                            pix_discount: current.discount_amount,
                            amount_to_pay: Math.round((existing.transaction_amount ?? 0) * 100),
                            qr_code: data.qr_code,
                            qr_code_base64: data.qr_code_base64,
                            ticket_url: data.ticket_url ?? null,
                            expires_at: existing.date_of_expiration,
                        };
                    }
                }
            } catch (error) {
                if (error instanceof OrderNotPayableError) throw error;
                console.error("[pix] Falha ao consultar o Pix anterior; gerando um novo:", error instanceof Error ? error.message : error);
            }
        }

        const user = await prismaClient.user.findUnique({ where: { id: user_id }, select: { email: true } });
        if (!user) {
            throw new OrderNotFoundError();
        }

        const pixExpiresAt = new Date(Date.now() + pixExpirationMinutes() * 60_000);

        let created;
        try {
            created = await mpPayment.create({
                body: {
                    transaction_amount: toReais(amountToPay),
                    description: `Pedido ${order.id.slice(0, 8).toUpperCase()} - Mandala Cristais`,
                    payment_method_id: "pix",
                    payer: { email: user.email },
                    external_reference: order.id,
                    notification_url: `${process.env.BACKEND_URL}/payment/webhook`,
                    date_of_expiration: toMercadoPagoDate(pixExpiresAt),
                },
                requestOptions: { idempotencyKey: `pix-${order.id}-${Date.now()}` },
            });
        } catch (error) {
            // Detalhes só no servidor; o cliente recebe a mensagem genérica
            console.error("[pix] Erro do Mercado Pago ao criar o Pix:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
            throw new PaymentCreationError();
        }

        const data = created.point_of_interaction?.transaction_data;
        if (!created.id || !data?.qr_code || !data.qr_code_base64) {
            console.error("[pix] Mercado Pago respondeu sem QR Code para o pedido", order.id);
            throw new PaymentCreationError();
        }

        // O pedido precisa viver tanto quanto o QR, senão a expiração cancelaria um Pix ainda válido
        const orderUntil = order.expires_at && order.expires_at > pixExpiresAt ? order.expires_at : pixExpiresAt;
        await prismaClient.order.updateMany({
            where: { id: order.id, status: "PENDING" },
            data: { expires_at: orderUntil },
        });

        const paymentData = {
            provider_payment_id: String(created.id),
            method: "pix",
            status: "PENDING" as const,
            discount_amount: pixDiscount,
            raw_payload: JSON.parse(JSON.stringify(created)),
        };
        await prismaClient.payment.upsert({
            where: { order_id: order.id },
            update: paymentData,
            create: { order_id: order.id, provider: "mercado_pago", ...paymentData },
        });

        return {
            order_id: order.id,
            payment_id: String(created.id),
            original_total: order.total,
            pix_discount: pixDiscount,
            amount_to_pay: amountToPay,
            qr_code: data.qr_code,
            qr_code_base64: data.qr_code_base64,
            ticket_url: data.ticket_url ?? null,
            expires_at: created.date_of_expiration ?? toMercadoPagoDate(pixExpiresAt),
        };
    }
}

export { CreatePixPaymentService };
