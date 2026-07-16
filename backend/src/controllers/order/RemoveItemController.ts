import { Request, Response } from "express";
import { RemoveItemOrderService } from "../../services/order/RemoveItemOrderService.js";

class RemoveItemController {
  async handle(req: Request, res: Response) {
    const { item_id } = req.query;

    const removeItem = new RemoveItemOrderService();
    const result = await removeItem.execute({ item_id: item_id as string });

    return res.status(200).json(result);
  }
}

export { RemoveItemController };

