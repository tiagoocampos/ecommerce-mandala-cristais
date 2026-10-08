// Tempo que o estoque fica reservado para um pedido PENDING (ORDER_EXPIRATION_MINUTES, padrão 30).
export function orderExpirationMinutes(): number {
    const value = Number(process.env.ORDER_EXPIRATION_MINUTES);
    return Number.isFinite(value) && value > 0 ? value : 30;
}

export function orderExpiresAt(from = Date.now()): Date {
    return new Date(from + orderExpirationMinutes() * 60_000);
}

/** Data no formato pedido pelo Mercado Pago (ISO 8601 com fuso): 2026-10-07T14:35:00.000-03:00 */
export function toMercadoPagoDate(date: Date): string {
    // Horário de Brasília (UTC-3, sem horário de verão desde 2019)
    const brasilia = new Date(date.getTime() - 3 * 60 * 60 * 1000);
    return brasilia.toISOString().replace("Z", "-03:00");
}
