import { Request, Response } from "express";
import { ListOrdersService } from "../../services/order/ListOrdersService.js";

class ListOrdersController {
    async handle(req: Request, res: Response) {
        const draft = req.query?.draft as string;
        const listOrders = new ListOrdersService();
        const orders = await listOrders.execute({ draft: draft });
        return res.status(200).json(orders);
    }
}


export { ListOrdersController };

