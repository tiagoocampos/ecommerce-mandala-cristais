import { Payment } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import prismaClient from "../../prisma/index.js";
import { OrderNotCancelableError, OrderNotFoundError } from "../../exceptions/OrdersErrors.js";
import { cancelOrderAndRestoreStock } from "./CancelOrderAndRestoreStockService.js";
import { GetOrderService } from "./GetOrderService.js";

interface CancelMyOrderServiceProps {
    order_id: string;
    user_id: string;
}

const PAID_MESSAGE = "Seu pagamento foi identificado. Atualize a página.";

// Cancelamento pelo próprio cliente: só pedido PENDING (pago/enviado é com o admin, por causa
// do reembolso). Um Pix em aberto é cancelado no Mercado Pago ANTES do pedido, para não sobrar
// um QR que ainda poderia ser pago num pedido cancelado.
class CancelMyOrderService {
    async execute({ order_id, user_id }: CancelMyOrderServiceProps) {
        const order = await prismaClient.order.findFirst({
            where: { id: order_id, user_id },
            include: { payment: true },
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        // Idempotente: já cancelado responde sucesso sem devolver estoque de novo
        if (order.status === "CANCELED") {
            return this.result(order.id, user_id);
        }
        if (order.status !== "PENDING") {
            throw new OrderNotCancelableError(
                "Este pedido já foi pago e não pode ser cancelado por aqui. Fale com a loja."
            );
        }

        const pix = order.payment;
        if (pix?.method === "pix" && pix.provider_payment_id) {
            await this.cancelPix(pix.provider_payment_id);
        }

        const { restored } = await cancelOrderAndRestoreStock(order.id, { onlyPending: true });
        if (!restored) {
            // Ninguém mudou PENDING -> CANCELED aqui: ou o job/outra aba cancelou, ou o webhook pagou
            const current = await prismaClient.order.findUnique({ where: { id: order.id }, select: { status: true } });
            if (current?.status !== "CANCELED") {
                throw new OrderNotCancelableError(PAID_MESSAGE);
            }
        }

        return this.result(order.id, user_id);
    }

    private async cancelPix(paymentId: string) {
        const mpPayment = new Payment(client);
        try {
            const current = await mpPayment.get({ id: paymentId });
            if (current.status === "approved") {
                throw new OrderNotCancelableError(PAID_MESSAGE);
            }
            if (current.status === "cancelled" || current.status === "expired") {
                return;
            }
            await mpPayment.cancel({ id: paymentId });
        } catch (error) {
            if (error instanceof OrderNotCancelableError) throw error;

            // Falha ao cancelar: pode ter sido aprovado no meio. Confere de novo antes de recusar.
            try {
                const again = await mpPayment.get({ id: paymentId });
                if (again.status === "approved") throw new OrderNotCancelableError(PAID_MESSAGE);
                if (again.status === "cancelled" || again.status === "expired") return;
            } catch (inner) {
                if (inner instanceof OrderNotCancelableError) throw inner;
            }

            console.error("[cancelar pedido] Não foi possível cancelar o Pix:", error instanceof Error ? error.message : error);
            throw new OrderNotCancelableError("Não foi possível cancelar agora. Tente novamente em instantes.", 503);
        }
    }

    private result(order_id: string, user_id: string) {
        return new GetOrderService().execute({ order_id, user_id });
    }
}

export { CancelMyOrderService };
