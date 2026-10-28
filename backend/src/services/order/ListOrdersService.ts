import prismaClient from "../../prisma/index.js";
import { canCancelOrder } from "../../utils/orderExpiration.js";
import { maybeExpireOrders } from "./MaybeExpireOrders.js";

interface ListOrdersServiceProps {
    user_id: string;
}

class ListOrdersService {
    async execute({ user_id }: ListOrdersServiceProps) {
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