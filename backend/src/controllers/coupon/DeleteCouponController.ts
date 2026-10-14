import { Request, Response } from "express";
import { DeleteCouponService } from "../../services/coupon/DeleteCouponService.js";

class DeleteCouponController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };

        const deleteCouponService = new DeleteCouponService();
        const result = await deleteCouponService.execute({ id });

        return res.status(200).json(result);
    }
}

export { DeleteCouponController };