import { UpdateOrderStatusService } from "../../services/order/UpdateOrderStatusService.js";
class UpdateOrderStatusController {
    async handle(req, res) {
        const { order_id } = req.params;
        const { status } = req.body;
        const updateOrderStatusService = new UpdateOrderStatusService();
        const updatedOrder = await updateOrderStatusService.execute({
            order_id,
            status: status,
        });
        return res.json(updatedOrder);
    }
}
export { UpdateOrderStatusController };
//# sourceMappingURL=UpdateOrderStatusController.js.map