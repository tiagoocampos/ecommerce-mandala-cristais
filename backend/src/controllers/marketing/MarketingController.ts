import { Request, Response } from "express";
import { SendMarketingEmailService } from "../../services/marketing/SendMarketingEmailService.js";
import { UnsubscribeMarketingService } from "../../services/marketing/UnsubscribeMarketingService.js";

class MarketingController {
    /** POST /admin/marketing/send (admin) */
    async send(req: Request, res: Response) {
        const { subject, message, user_ids } = req.body;
        const result = await new SendMarketingEmailService().execute({
            subject: String(subject).trim(),
            message: String(message),
            user_ids,
        });
        return res.json(result);
    }

    /** POST /marketing/unsubscribe (público) */
    async unsubscribe(req: Request, res: Response) {
        const { token } = req.body;
        const result = await new UnsubscribeMarketingService().execute({ token });
        return res.json(result);
    }
}

export { MarketingController };
