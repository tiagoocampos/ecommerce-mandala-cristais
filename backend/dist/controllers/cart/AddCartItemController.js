import { AddCartItemService } from "../../services/cart/AddCartItemService.js";
class AddCartItemController {
    async handle(req, res) {
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
//# sourceMappingURL=AddCartItemController.js.map