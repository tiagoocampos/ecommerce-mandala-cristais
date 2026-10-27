// Mínimo aceito pelo Mercado Pago para date_of_expiration de Pix
const PIX_MIN_EXPIRATION_MINUTES = 30;

export function pixExpirationMinutes(): number {
    const value = Number(process.env.PIX_EXPIRATION_MINUTES);
    const minutes = Number.isFinite(value) && value > 0 ? value : 60;
    return Math.max(PIX_MIN_EXPIRATION_MINUTES, minutes);
}

/** Percentual de desconto no Pix (PIX_DISCOUNT_PERCENT, padrão 5; 0 desliga). */
export function pixDiscountPercent(): number {
    const raw = process.env.PIX_DISCOUNT_PERCENT;
    if (raw === undefined || raw.trim() === "") return 5;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 0 && value <= 100 ? value : 5;
}

/** Desconto do Pix em centavos: incide sobre os produtos já com cupom, nunca sobre o frete. */
export function calculatePixDiscount(order: { subtotal: number; discount: number }): number {
    const base = Math.max(0, order.subtotal - order.discount);
    return Math.round((base * pixDiscountPercent()) / 100);
}
