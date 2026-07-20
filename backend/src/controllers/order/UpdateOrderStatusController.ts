import { Request, Response } from "express";
import { UpdateOrderStatusService } from "../../services/order/UpdateOrderStatusService.js";
import { OrderStatus } from "../../generated/prisma/enums.js";

class UpdateOrderStatusController {
    async handle(req: Request, res: Response) {
        const { order_id } = req.params as { order_id: string };
        const { status } = req.body as { status: string };

        const updateOrderStatusService = new UpdateOrderStatusService();

        const updatedOrder = await updateOrderStatusService.execute({
            order_id,
            status: status as OrderStatus,
        });

        return res.json(updatedOrder);
    }
}



export { UpdateOrderStatusController };