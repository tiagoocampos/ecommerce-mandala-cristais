import { z } from "zod";
export declare const META_DESCRIPTION_MAX = 160;
export declare const createProductSchema: z.ZodObject<{
    body: z.ZodObject<{
        featured: z.ZodOptional<z.ZodEnum<{
            true: "true";
            false: "false";
        }>>;
        meta_description: z.ZodOptional<z.ZodString>;
        image_alt_text: z.ZodOptional<z.ZodString>;
        weight_grams: z.ZodOptional<z.ZodString>;
        height_cm: z.ZodOptional<z.ZodString>;
        width_cm: z.ZodOptional<z.ZodString>;
        length_cm: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        description: z.ZodString;
        price: z.ZodString;
        promo_price: z.ZodOptional<z.ZodString>;
        stock: z.ZodString;
        category_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const productAIAssistSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        category_hint: z.ZodOptional<z.ZodString>;
        keywords: z.ZodOptional<z.ZodString>;
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
        disabled: z.ZodOptional<z.ZodEnum<{
            true: "true";
            false: "false";
        }>>;
        featured: z.ZodOptional<z.ZodEnum<{
            true: "true";
            false: "false";
        }>>;
        meta_description: z.ZodOptional<z.ZodString>;
        image_alt_text: z.ZodOptional<z.ZodString>;
        weight_grams: z.ZodOptional<z.ZodString>;
        height_cm: z.ZodOptional<z.ZodString>;
        width_cm: z.ZodOptional<z.ZodString>;
        length_cm: z.ZodOptional<z.ZodString>;
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodString>;
        promo_price: z.ZodOptional<z.ZodString>;
        stock: z.ZodOptional<z.ZodString>;
        category_id: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=productSchema.d.ts.map