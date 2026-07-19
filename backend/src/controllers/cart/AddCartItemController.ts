import { Request, Response } from "express";

import { AddCartItemService } from "../../services/cart/AddCartItemService.js";

class AddCartItemController {
    async handle(req: Request, res: Response) {

        const user_id = req.user_id;

        const { product_id, quantity } = req.body;

        const addCartItemService = new AddCartItemService();

        const cartItem = await addCartItemService.execute({
            user_id,
            product_id,
            quantity,
        });

        return res.json(cartItem);
    }
}

export { AddCartItemController };