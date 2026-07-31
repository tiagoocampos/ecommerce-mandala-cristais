import prismaClient from "../../prisma/index.js";
class ListOrdersService {
    async execute({ user_id }) {
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
        return orders;
    }
}
export { ListOrdersService };
//# sourceMappingURL=ListOrdersService.js.map