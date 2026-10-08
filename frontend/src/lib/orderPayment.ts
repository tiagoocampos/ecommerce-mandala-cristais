import type { OrderStatus } from "../types";

type PayableOrder = { status: OrderStatus; expires_at?: string | null };

/**
 * Situação de pagamento de um pedido. "PENDING" com prazo vencido conta como expirado
 * mesmo antes do job do backend cancelar (o backend também recusa pagar nesse caso).
 */
export function orderPaymentState(order: PayableOrder) {
    const expiresAt = order.expires_at ? new Date(order.expires_at) : null;
    const expired = order.status === "PENDING" && !!expiresAt && expiresAt.getTime() <= Date.now();
    return {
        payable: order.status === "PENDING" && !expired,
        expired,
        /** "Reservado até 14:35" (ou com a data, se não for hoje) */
        reservedUntil:
            order.status === "PENDING" && expiresAt && !expired ? `Reservado até ${formatTime(expiresAt)}` : null,
    };
}

function formatTime(date: Date) {
    const sameDay = date.toDateString() === new Date().toDateString();
    const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return sameDay ? time : `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} às ${time}`;
}
