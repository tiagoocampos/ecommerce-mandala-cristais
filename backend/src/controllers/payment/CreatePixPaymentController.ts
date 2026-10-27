import { Request, Response } from 'express';
import { CreatePixPaymentService } from '../../services/payment/CreatePixPaymentService.js';

class CreatePixPaymentController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        const { order_id } = req.body;

        const pix = await new CreatePixPaymentService().execute({ order_id, user_id });

        return res.json(pix);
    }
}

export { CreatePixPaymentController };
