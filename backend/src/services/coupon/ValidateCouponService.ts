import prismaClient from "../../prisma/index.js";
import { calculateCartSubtotal } from "../cart/calculateCartSubtotal.js";
import { validateCoupon } from "./validateCoupon.js";

// Pré-validação para o checkout: roda a mesma regra do CreateOrderService, sem criar pedido.
class ValidateCouponService {
    async execute({ code, user_id }: { code: string; user_id: string }) {
        const cart = await prismaClient.cart.findUnique({
            where: { user_id },
            include: { items: { include: { product: { select: { price: true, promo_price: true } } } } },
        });

        const subtotal = calculateCartSubtotal(cart?.items ?? []);
        const { coupon, discount } = await validateCoupon({ code, user_id, subtotal });

        return {
            valid: true,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discount,
        };
    }
}

export { ValidateCouponService };
