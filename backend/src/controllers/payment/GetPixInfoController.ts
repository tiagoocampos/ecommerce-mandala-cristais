import { Request, Response } from 'express';
import { pixDiscountPercent } from '../../config/pix.js';

class GetPixInfoController {
    async handle(req: Request, res: Response) {
        return res.json({ discount_percent: pixDiscountPercent() });
    }
}

export { GetPixInfoController };
