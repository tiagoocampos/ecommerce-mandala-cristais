import { z } from "zod";
import { couponValueFields, refineCouponValue } from "./couponSchema.js";
export const userIdParamsSchema = z.object({
    params: z.object({
        id: z.string().min(1),
    }),
});
export const createUserDiscountSchema = z.object({
    params: z.object({
        id: z.string().min(1),
    }),
    body: z.object(couponValueFields).superRefine(refineCouponValue),
});
//# sourceMappingURL=userAdminSchema.js.map