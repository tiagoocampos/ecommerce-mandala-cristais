import { Request, Response } from "express";

class WebhookController {
    async handle(req: Request, res: Response) {

        console.log("CHEGOU!");

        return res.status(200).json({
            ok: true
        });

    }
}

export { WebhookController };