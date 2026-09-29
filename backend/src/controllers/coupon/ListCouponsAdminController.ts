import { Request, Response } from "express";
import { ListCouponsAdminService } from "../../services/coupon/ListCouponsAdminService.js";

class ListCouponsAdminController {
    async handle(req: Request, res: Response) {
        const listCouponsAdminService = new ListCouponsAdminService();
        const coupons = await listCouponsAdminService.execute();

        return res.json(coupons);
    }
}

export { ListCouponsAdminController };
