import { Request, Response } from "express";
import { WebhookService } from "../../services/payment/WebhookService.js";


class WebhookController {
    async handle(req: Request, res: Response) {
        try {
            console.log("===== CHEGOU NO CONTROLLER =====");

            const webhookService = new WebhookService();

            await webhookService.execute(req.body);

            return res.status(200).json({
                ok: true,
            });

        } catch (error) {
            console.error("ERRO NO CONTROLLER:", error);

            return res.status(500).json({
                ok: false,
                message: "Erro ao processar webhook.",
            });
        }
    }
}

export { WebhookController };