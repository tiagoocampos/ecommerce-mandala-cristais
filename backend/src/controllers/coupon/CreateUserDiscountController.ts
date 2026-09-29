import { Request, Response } from "express";
import { CreateUserDiscountService } from "../../services/coupon/CreateUserDiscountService.js";

class CreateUserDiscountController {
    async handle(req: Request, res: Response) {
        const { id } = req.params as { id: string };
        const { type, value, expires_at } = req.body;

        const createUserDiscountService = new CreateUserDiscountService();
        const coupon = await createUserDiscountService.execute({
            user_id: id,
            type,
            value,
            expires_at,
        });

        return res.status(201).json(coupon);
    }
}

export { CreateUserDiscountController };
