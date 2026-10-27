import prismaClient from "../../prisma/index.js";
import { maybeExpireOrders } from "./MaybeExpireOrders.js";

class ListAllOrdersAdminService {
    async execute() {
        maybeExpireOrders();
        const orders = await prismaClient.order.findMany({
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                address: {
                    select: {
                        city: true,
                        state: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
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

export { ListAllOrdersAdminService };