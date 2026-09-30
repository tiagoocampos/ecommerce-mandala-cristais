import { Request, Response } from "express";
import { CreateOrderService } from "../../services/order/CreateOrderService.js";

class CreateOrderController {
  async handle(req: Request, res: Response) {
    const user_id = req.user_id;

    const { address_id, coupon_code, shipping_service, shipping_quote_cents } = req.body;

    const createOrderService = new CreateOrderService();

    const order = await createOrderService.execute({
      user_id,
      address_id,
      coupon_code,
      shipping_service: String(shipping_service).trim(),
      shipping_quote_cents,
    });

    return res.json(order);
  }
}

export { CreateOrderController };
