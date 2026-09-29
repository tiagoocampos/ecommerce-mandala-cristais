import type { Coupon } from "../../generated/prisma/client.js";
import { InvalidCouponError } from "../../exceptions/CouponErrors.js";
import prismaClient from "../../prisma/index.js";
import { PAID_ORDER_STATUSES } from "../../utils/orderStatus.js";

interface ValidateCouponProps {
    code: string;
    user_id: string;
    subtotal: number;
}

export function calculateDiscount(coupon: Pick<Coupon, "type" | "value">, subtotal: number): number {
    const raw =
        coupon.type === "PERCENTAGE"
            ? Math.round((subtotal * coupon.value) / 100)
            : coupon.value;
    // desconto nunca maior que o subtotal (total nunca negativo)
    return Math.max(0, Math.min(raw, subtotal));
}

// Regra única de validação de cupom — usada no checkout (CreateOrderService)
// e na pré-validação (POST /coupons/validate), para as duas nunca divergirem.
export async function validateCoupon({ code, user_id, subtotal }: ValidateCouponProps) {
    const coupon = await prismaClient.coupon.findUnique({
        where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.active) {
        throw new InvalidCouponError("Cupom inválido ou inativo");
    }

    if (coupon.expires_at && coupon.expires_at.getTime() < Date.now()) {
        throw new InvalidCouponError("Este cupom expirou");
    }

    if (coupon.user_id && coupon.user_id !== user_id) {
        throw new InvalidCouponError("Este cupom não é válido para a sua conta");
    }

    if (coupon.first_purchase_only) {
        const paidOrders = await prismaClient.order.count({
            where: { user_id, status: { in: PAID_ORDER_STATUSES } },
        });
        if (paidOrders > 0) {
            throw new InvalidCouponError("Este cupom é válido apenas na primeira compra");
        }
    }

    return { coupon, discount: calculateDiscount(coupon, subtotal) };
}
