import { OrderNotFoundError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";
class UpdateOrderStatusService {
    async execute({ order_id, status }) {
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
//# sourceMappingURL=UpdateOrderStatusService.js.map