import { Request, Response } from "express";
import { ListAllOrdersAdminService } from "../../services/order/ListAllOrdersAdminService.js";


class ListAllOrdersAdminController {
    async handle(req: Request, res: Response) {
        const listAllOrdersAdminService = new ListAllOrdersAdminService();
        const orders = await listAllOrdersAdminService.execute();
        return res.json(orders);
    }
}

export { ListAllOrdersAdminController };