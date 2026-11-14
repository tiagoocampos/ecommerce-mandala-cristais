import { CreateOrderService } from "../../services/order/CreateOrderService.js";
class CreateOrderController {
    async handle(req, res) {
        const user_id = req.user_id;
        const { delivery_method, address_id, coupon_code, shipping_service, shipping_quote_cents } = req.body;
        const createOrderService = new CreateOrderService();
        const order = await createOrderService.execute({
            user_id,
            delivery_method,
            ...(address_id && { address_id }),
            ...(coupon_code && { coupon_code }),
            ...(shipping_service && { shipping_service: String(shipping_service).trim() }),
            ...(shipping_quote_cents && { shipping_quote_cents }),
        });
        return res.json(order);
    }
}
export { CreateOrderController };
//# sourceMappingURL=CreateOrderController.js.map