import { Request, Response } from "express";
import { ShippingQuoteService } from "../../services/shipping/ShippingQuoteService.js";

class ShippingQuoteController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        const { address_id } = req.body;

        const shippingQuoteService = new ShippingQuoteService();
        const options = await shippingQuoteService.execute({ user_id, address_id });

        return res.json(options);
    }
}

export { ShippingQuoteController };
