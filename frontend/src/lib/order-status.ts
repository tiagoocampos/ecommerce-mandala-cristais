import type { DeliveryMethod, OrderStatus } from "../types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Aguardando pagamento",
    PAID: "Pago",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
};

// Retirada na loja usa os mesmos status; só os rótulos mudam
const PICKUP_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
    SHIPPED: "Pronto para retirada",
    DELIVERED: "Retirado",
};

export function orderStatusLabel(status: OrderStatus, deliveryMethod?: DeliveryMethod | null): string {
    if (deliveryMethod === "PICKUP") {
        return PICKUP_STATUS_LABELS[status] ?? ORDER_STATUS_LABELS[status];
    }
    return ORDER_STATUS_LABELS[status];
}
