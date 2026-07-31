import { z } from "zod";
export declare const createProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        price: z.ZodString;
        promo_price: z.ZodOptional<z.ZodString>;
        stock: z.ZodString;
        category_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listProductsSchema: z.ZodObject<{
    query: z.ZodObject<{
        disabled: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const listProductsByCategorySchema: z.ZodObject<{
    query: z.ZodObject<{
        category_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodString>;
        promo_price: z.ZodOptional<z.ZodString>;
        stock: z.ZodOptional<z.ZodString>;
        category_id: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=productSchema.d.ts.map