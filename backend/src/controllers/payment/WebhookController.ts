import { Request, Response } from "express";
import { WebhookService } from "../../services/payment/WebhookService.js";


class WebhookController {
    async handle(req: Request, res: Response) {

        const webhookService = new WebhookService();

        await webhookService.execute(req.body);

        return res.sendStatus(200);
    }
}

export { WebhookController };