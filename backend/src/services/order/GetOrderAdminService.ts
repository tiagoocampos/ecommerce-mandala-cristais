import { OrderNotFoundError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";


interface GetOrderAdminServiceProps {
    order_id: string;
}

class GetOrderAdminService {
    async execute({ order_id }: GetOrderAdminServiceProps) {
        const order = await prismaClient.order.findFirst({
            where: {
                id: order_id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                address: true,
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

        if (!order) {
            throw new OrderNotFoundError();
        }

        return order;
    }
}

export { GetOrderAdminService };