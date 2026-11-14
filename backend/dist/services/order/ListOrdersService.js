import prismaClient from "../../prisma/index.js";
import { canCancelOrder } from "../../utils/orderExpiration.js";
import { maybeExpireOrders } from "./MaybeExpireOrders.js";
class ListOrdersService {
    async execute({ user_id }) {
        maybeExpireOrders();
        const orders = await prismaClient.order.findMany({
            where: {
                user_id,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
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
        return orders.map((order) => ({ ...order, can_cancel: canCancelOrder(order) }));
    }
}
export { ListOrdersService };
//# sourceMappingURL=ListOrdersService.js.map