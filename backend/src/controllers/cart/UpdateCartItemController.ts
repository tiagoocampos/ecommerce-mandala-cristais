import { Request, Response } from "express";
import { UpdateCartItemService } from "../../services/cart/UpdateCartItemService.js";

class UpdateCartItemController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        const { id } = req.params as { id: string };
        const { quantity } = req.body;

        const updateCartItemService = new UpdateCartItemService();

        const cartItem = await updateCartItemService.execute({
            id,
            quantity,
            user_id,
        });

        return res.json(cartItem);
    }
}

export { UpdateCartItemController };