import { GetOrderAdminService } from "../../services/order/GetOrderAdminService.js";
class GetOrderAdminController {
    async handle(req, res) {
        const { order_id } = req.params;
        const getOrderAdminService = new GetOrderAdminService();
        const order = await getOrderAdminService.execute({ order_id });
        return res.json(order);
    }
}
export { GetOrderAdminController };
//# sourceMappingURL=GetOrderAdminController.js.map