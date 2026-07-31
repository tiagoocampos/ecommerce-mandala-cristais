import { z } from "zod";
export declare const createOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        address_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const AddItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        amount: z.ZodNumber;
        order_id: z.ZodString;
        product_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const RemoveItemSchema: z.ZodObject<{
    query: z.ZodObject<{
        item_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const SendOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        order_id: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const FinishOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        order_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const DeleteOrderSchema: z.ZodObject<{
    query: z.ZodObject<{
        order_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getOrderSchema: z.ZodObject<{
    params: z.ZodObject<{
        order_id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=orderSchema.d.ts.map