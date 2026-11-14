import { calculatePixDiscount } from "../../config/pix.js";
import prismaClient from "../../prisma/index.js";
import { canCancelOrder } from "../../utils/orderExpiration.js";
import { maybeExpireOrders } from "./MaybeExpireOrders.js";
import { maybeReconcileOrderPayment } from "../payment/reconcileOrderPayment.js";
class GetOrderService {
    async execute({ user_id, order_id }) {
        maybeExpireOrders();
        const order = await prismaClient.order.findFirst({
            where: {
                id: order_id,
                user_id,
            },
            include: {
                payment: { select: { method: true, status: true, discount_amount: true } },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                promo_price: true,
                                price: true,
                                banner: true,
                            },
                        },
                    },
                },
            },
        });
        if (!order) {
            return order;
        }
        const can_cancel = canCancelOrder(order);
        if (order.status !== "PENDING") {
            return { ...order, can_cancel };
        }
        // Rede de segurança para webhook perdido: confere no Mercado Pago em segundo plano
        // (sem await, com throttle por pedido); a resposta atual não espera por isso.
        if (order.payment) {
            maybeReconcileOrderPayment(order.id);
        }
        // Só exibição: nada é gravado até o Pix ser aprovado
        const pix_discount = calculatePixDiscount(order);
        return { ...order, can_cancel, pix_discount, pix_total: order.total - pix_discount };
    }
}
export { GetOrderService };
//# sourceMappingURL=GetOrderService.js.map