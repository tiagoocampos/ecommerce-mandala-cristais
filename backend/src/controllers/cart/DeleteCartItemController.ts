import { Request, Response } from "express";
import { DeleteCartItemService } from "../../services/cart/DeleteCartItemService.js";

class DeleteCartItemController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        const { id } = req.params as { id: string };

        const deleteCartItemService = new DeleteCartItemService();

        const result = await deleteCartItemService.execute({
            id,
            user_id,
        });

        return res.json(result);
    }
}

export { DeleteCartItemController };