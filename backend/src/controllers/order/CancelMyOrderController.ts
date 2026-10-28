import { Request, Response } from "express";
import { CancelMyOrderService } from "../../services/order/CancelMyOrderService.js";

class CancelMyOrderController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        const { id } = req.params as { id: string };

        const order = await new CancelMyOrderService().execute({ order_id: id, user_id });

        return res.json(order);
    }
}

export { CancelMyOrderController };
