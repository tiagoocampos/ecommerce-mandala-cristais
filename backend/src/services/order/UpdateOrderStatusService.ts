
import { OrderNotFoundError } from "../../exceptions/OrdersErrors.js";
import { OrderStatus } from "../../generated/prisma/enums.js";
import prismaClient from "../../prisma/index.js";

interface UpdateOrderStatusServiceProps {
    order_id: string;
    status: OrderStatus;
}

class UpdateOrderStatusService {
    async execute({ order_id, status }: UpdateOrderStatusServiceProps) {

        const order = await prismaClient.order.findUnique({
            where: {
                id: order_id,
            },
        });

        if (!order) {
            throw new OrderNotFoundError();
        }

        const updatedOrder = await prismaClient.order.update({
            where: {
                id: order_id,
            },
            data: {
                status,
            },
        });

        return updatedOrder;
    }
}

export { UpdateOrderStatusService };