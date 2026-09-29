import { CreateOrderService } from "../../services/order/CreateOrderService.js";
class CreateOrderController {
    async handle(req, res) {
        const user_id = req.user_id;
        const { address_id, coupon_code } = req.body;
        const createOrderService = new CreateOrderService();
        const order = await createOrderService.execute({
            user_id,
            address_id,
            coupon_code,
        });
        return res.json(order);
    }
}
export { CreateOrderController };
//# sourceMappingURL=CreateOrderController.js.map