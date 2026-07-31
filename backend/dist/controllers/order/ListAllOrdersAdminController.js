import { ListAllOrdersAdminService } from "../../services/order/ListAllOrdersAdminService.js";
class ListAllOrdersAdminController {
    async handle(req, res) {
        const listAllOrdersAdminService = new ListAllOrdersAdminService();
        const orders = await listAllOrdersAdminService.execute();
        return res.json(orders);
    }
}
export { ListAllOrdersAdminController };
//# sourceMappingURL=ListAllOrdersAdminController.js.map