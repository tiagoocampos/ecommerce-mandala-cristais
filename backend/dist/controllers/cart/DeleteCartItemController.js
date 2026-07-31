import { DeleteCartItemService } from "../../services/cart/DeleteCartItemService.js";
class DeleteCartItemController {
    async handle(req, res) {
        const user_id = req.user_id;
        const { id } = req.params;
        const deleteCartItemService = new DeleteCartItemService();
        const result = await deleteCartItemService.execute({
            id,
            user_id,
        });
        return res.json(result);
    }
}
export { DeleteCartItemController };
//# sourceMappingURL=DeleteCartItemController.js.map