import { ListOrdersService } from "../../services/order/ListOrdersService.js";
class ListOrdersController {
    async handle(req, res) {
        const user_id = req.user_id;
        const listOrdersService = new ListOrdersService();
        const orders = await listOrdersService.execute({ user_id });
        return res.json(orders);
    }
}
export { ListOrdersController };
//# sourceMappingURL=ListOrdersController.js.map