import { Request, Response } from "express";
declare class WebhookController {
    handle(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export { WebhookController };
//# sourceMappingURL=WebhookController.d.ts.map