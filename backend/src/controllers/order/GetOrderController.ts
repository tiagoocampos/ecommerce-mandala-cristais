import { Request, Response } from "express";
import { GetOrderService } from "../../services/order/GetOrderService.js";

class GetOrderController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        const { order_id } = req.params as { order_id: string };

        const getOrderService = new GetOrderService();

        const order = await getOrderService.execute({
            user_id,
            order_id,
        });

        return res.json(order);
    }
}

export { GetOrderController };