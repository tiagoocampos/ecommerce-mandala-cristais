import { z } from "zod";
export declare const userIdParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createUserDiscountSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        type: z.ZodEnum<{
            PERCENTAGE: "PERCENTAGE";
            FIXED: "FIXED";
        }>;
        value: z.ZodNumber;
        expires_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=userAdminSchema.d.ts.map