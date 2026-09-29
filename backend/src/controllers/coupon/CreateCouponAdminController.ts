import { Request, Response } from "express";
import { CreateCouponAdminService } from "../../services/coupon/CreateCouponAdminService.js";

class CreateCouponAdminController {
    async handle(req: Request, res: Response) {
        const { code, type, value, first_purchase_only, expires_at } = req.body;

        const createCouponAdminService = new CreateCouponAdminService();
        const coupon = await createCouponAdminService.execute({
            code,
            type,
            value,
            first_purchase_only,
            expires_at,
        });

        return res.status(201).json(coupon);
    }
}

export { CreateCouponAdminController };
