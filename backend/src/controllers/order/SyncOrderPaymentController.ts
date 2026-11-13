import { Request, Response } from "express";
import { SyncOrderPaymentService } from "../../services/order/SyncOrderPaymentService.js";

class SyncOrderPaymentController {
    // dono do pedido
    async handle(req: Request, res: Response) {
        const { order_id } = req.params as { order_id: string };
        const order = await new SyncOrderPaymentService().execute({ order_id, user_id: req.user_id });
        return res.json(order);
    }

    // admin
    async handleAdmin(req: Request, res: Response) {
        const { order_id } = req.params as { order_id: string };
        const order = await new SyncOrderPaymentService().execute({ order_id });
        return res.json(order);
    }
}

export { SyncOrderPaymentController };
