import { InvalidStatusTransitionError, OrderNotFoundError } from "../../exceptions/OrdersErrors.js";
import { OrderStatus } from "../../generated/prisma/enums.js";
import prismaClient from "../../prisma/index.js";
import { cancelOrderAndRestoreStock } from "./CancelOrderAndRestoreStockService.js";

interface UpdateOrderStatusServiceProps {
    order_id: string;
    status: OrderStatus;
}

// Transições permitidas. CANCELED e DELIVERED são finais: o estoque de um cancelado já
// voltou, e reativá-lo exigiria nova reserva (fora de escopo).
export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["PAID", "CANCELED"],
    PAID: ["SHIPPED", "CANCELED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELED: [],
};

class UpdateOrderStatusService {
    async execute({ order_id, status }: UpdateOrderStatusServiceProps) {
        const order = await prismaClient.order.findUnique({ where: { id: order_id } });

        if (!order) {
            throw new OrderNotFoundError();
        }

        if (!ALLOWED_TRANSITIONS[order.status].includes(status)) {
            throw new InvalidStatusTransitionError(order.status, status);
        }

        if (status === "CANCELED") {
            // Devolve o estoque pelo serviço único (idempotente). Pedido PAID: reembolso é
            // MANUAL no painel do Mercado Pago — não há estorno automático.
            const { restored } = await cancelOrderAndRestoreStock(order_id);
            const updated = await prismaClient.order.findUnique({ where: { id: order_id } });
            return {
                ...updated,
                stock_restored: restored,
                ...(order.status === "PAID" && {
                    notice: "Estoque devolvido. O reembolso deste pedido pago deve ser feito manualmente no painel do Mercado Pago.",
                }),
            };
        }

        // updateMany condicionado ao status lido: evita sobrescrever uma mudança feita
        // no meio do caminho (ex.: webhook ou job) entre a leitura e a gravação
        const changed = await prismaClient.order.updateMany({
            where: { id: order_id, status: order.status },
            data: { status },
        });
        if (changed.count === 0) {
            const current = await prismaClient.order.findUnique({ where: { id: order_id }, select: { status: true } });
            throw new InvalidStatusTransitionError(current?.status ?? order.status, status);
        }

        return prismaClient.order.findUnique({ where: { id: order_id } });
    }
}

export { UpdateOrderStatusService };
