import { Request, Response } from "express";
import { ValidateCouponService } from "../../services/coupon/ValidateCouponService.js";

class ValidateCouponController {
    async handle(req: Request, res: Response) {
        const user_id = req.user_id;
        const { code } = req.body;

        const validateCouponService = new ValidateCouponService();
        const result = await validateCouponService.execute({ code, user_id });

        return res.json(result);
    }
}

export { ValidateCouponController };
