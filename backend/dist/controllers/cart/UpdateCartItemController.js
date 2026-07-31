import { UpdateCartItemService } from "../../services/cart/UpdateCartItemService.js";
class UpdateCartItemController {
    async handle(req, res) {
        const user_id = req.user_id;
        const { id } = req.params;
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
//# sourceMappingURL=UpdateCartItemController.js.map