import { Request, Response } from "express";
import { DetailOrderService } from "../../services/order/DetailOrderService.js";

class DetailOrderController {
  async handle(req: Request, res: Response) {
    const order_id = req.query.order_id as string;

    const detailOrderService = new DetailOrderService();
    const details = await detailOrderService.execute({ order_id });

    return res.status(200).json(details);
  }
}

export { DetailOrderController };

