import { calculatePixDiscount } from "../../config/pix.js";
import prismaClient from "../../prisma/index.js";
import { canCancelOrder } from "../../utils/orderExpiration.js";
import { maybeExpireOrders } from "./MaybeExpireOrders.js";

interface GetOrderServiceProps {
    user_id: string;
    order_id: string;
}

class GetOrderService {
    async execute({ user_id, order_id }: GetOrderServiceProps) {
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
        // Só exibição: nada é gravado até o Pix ser aprovado
        const pix_discount = calculatePixDiscount(order);
        return { ...order, can_cancel, pix_discount, pix_total: order.total - pix_discount };
    }
}

export { GetOrderService };