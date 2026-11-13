import { OrderNotFoundError } from "../../exceptions/OrdersErrors.js";
import { PaymentSyncError } from "../../exceptions/PaymentErrors.js";
import prismaClient from "../../prisma/index.js";
import { reconcileOrderPayment } from "../payment/reconcileOrderPayment.js";
import { GetOrderAdminService } from "./GetOrderAdminService.js";
import { GetOrderService } from "./GetOrderService.js";

interface SyncOrderPaymentServiceProps {
    order_id: string;
    /** Informado = só o dono do pedido; ausente = admin (já autorizado na rota). */
    user_id?: string;
}

/** Reconcilia o pedido com o Mercado Pago na hora e devolve o pedido atualizado. */
class SyncOrderPaymentService {
    async execute({ order_id, user_id }: SyncOrderPaymentServiceProps) {
        const exists = await prismaClient.order.findFirst({
            where: { id: order_id, ...(user_id && { user_id }) },
            select: { id: true },
        });
        if (!exists) {
            throw new OrderNotFoundError();
        }

        let result;
        try {
            result = await reconcileOrderPayment(order_id);
        } catch (error) {
            console.error("[sync-payment] falha ao consultar o Mercado Pago:", error instanceof Error ? error.message : "erro");
            throw new PaymentSyncError();
        }

        const order = user_id
            ? await new GetOrderService().execute({ user_id, order_id })
            : await new GetOrderAdminService().execute({ order_id });

        return {
            ...order,
            sync: {
                outcome: result.outcome,
                manual_refund: result.manual_refund,
                // só o admin vê detalhes operacionais (reembolso manual etc.)
                ...(!user_id && { message: result.message }),
            },
        };
    }
}

export { SyncOrderPaymentService };
