import { z } from "zod";
export declare const createAddressSchema: z.ZodObject<{
    body: z.ZodObject<{
        street: z.ZodString;
        number: z.ZodString;
        complement: z.ZodOptional<z.ZodString>;
        neighborhood: z.ZodString;
        city: z.ZodString;
        state: z.ZodString;
        zip_code: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const deleteAddressSchema: z.ZodObject<{
    query: z.ZodObject<{
        address_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateAddressSchema: z.ZodObject<{
    body: z.ZodObject<{
        street: z.ZodOptional<z.ZodString>;
        number: z.ZodOptional<z.ZodString>;
        complement: z.ZodOptional<z.ZodString>;
        neighborhood: z.ZodOptional<z.ZodString>;
        city: z.ZodOptional<z.ZodString>;
        state: z.ZodOptional<z.ZodString>;
        zip_code: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    query: z.ZodObject<{
        address_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=adressSchema.d.ts.map