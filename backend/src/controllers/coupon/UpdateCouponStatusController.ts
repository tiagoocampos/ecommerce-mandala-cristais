import { Request, Response } from "express";
import { UpdateCouponStatusService } from "../../services/coupon/UpdateCouponStatusService.js";

class UpdateCouponStatusController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { active } = req.body;

        const updateCouponStatusService = new UpdateCouponStatusService();
        const coupon = await updateCouponStatusService.execute({ id, active });

        return res.json(coupon);
    }
}

export { UpdateCouponStatusController };
