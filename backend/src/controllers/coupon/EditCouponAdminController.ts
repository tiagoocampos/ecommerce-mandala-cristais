import { Request, Response } from "express";
import { EditCouponAdminService } from "../../services/coupon/EditCouponAdminService.js";

class EditCouponAdminController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { code, type, value, first_purchase_only, expires_at } = req.body;

        const editCouponAdminService = new EditCouponAdminService();
        const coupon = await editCouponAdminService.execute({ id, code, type, value, first_purchase_only, expires_at });

        return res.json(coupon);
    }
}

export { EditCouponAdminController };
