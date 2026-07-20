import { Request, Response } from "express";
import { ListOrdersService } from "../../services/order/ListOrdersService.js";

class ListOrdersController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;

        const listOrdersService = new ListOrdersService();
        const orders = await listOrdersService.execute({ user_id });

        return res.json(orders);

    }
}

export { ListOrdersController };

