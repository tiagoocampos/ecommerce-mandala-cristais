import prismaClient from "../../prisma/index.js";
class GetOrderService {
    async execute({ user_id, order_id }) {
        const order = await prismaClient.order.findFirst({
            where: {
                id: order_id,
                user_id,
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
        return order;
    }
}
export { GetOrderService };
//# sourceMappingURL=GetOrderService.js.map