import { z } from "zod";
export declare const addCartItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        product_id: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateCartItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        quantity: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=cartSchema.d.ts.map