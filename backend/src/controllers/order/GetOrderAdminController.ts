import { Request, Response } from "express";
import { GetOrderAdminService } from "../../services/order/GetOrderAdminService.js";


class GetOrderAdminController {
    async handle(req: Request, res: Response) {
        const { order_id } = req.params as { order_id: string };

        const getOrderAdminService = new GetOrderAdminService();
        const order = await getOrderAdminService.execute({ order_id });

        return res.json(order);
    }
}

export { GetOrderAdminController };