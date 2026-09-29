import type { Coupon, PaymentStatus } from "../types/admin";
import { formatPrice } from "./utils-api";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Recusado",
    REFUNDED: "Reembolsado",
};

export function formatCouponValue(coupon: Pick<Coupon, "type" | "value">): string {
    return coupon.type === "PERCENTAGE" ? `${coupon.value}%` : formatPrice(coupon.value);
}

export function formatDay(date: string | null): string {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR");
}

export function isCouponExpired(coupon: Pick<Coupon, "expires_at">): boolean {
    return !!coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now();
}

/** "12,50" | "12.50" | "12" -> 1250 centavos (null se inválido) */
export function reaisToCents(value: string): number | null {
    const raw = value.trim();
    if (!raw) return null;
    // com vírgula, os pontos são separador de milhar ("1.299,90")
    const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
    const number = Number(normalized);
    if (!Number.isFinite(number) || number < 0) return null;
    return Math.round(number * 100);
}

export function centsToReais(cents: number | null | undefined): string {
    if (cents === null || cents === undefined) return "";
    return (cents / 100).toFixed(2).replace(".", ",");
}
