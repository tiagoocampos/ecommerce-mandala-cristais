import { z } from "zod";



export const addCartItemSchema = z.object({
    body: z.object({
        product_id: z.string({ message: "O product_id deve ser uma string"}).uuid(),
        quantity: z.number({ message: "A quantidade deve ser um número"}).min(1, { message: "A quantidade deve ser maior que zero" }),
    })
});

export const updateCartItemSchema = z.object({
    body: z.object({
        quantity: z.number({ message: "A quantidade deve ser um número"}).min(1, { message: "A quantidade deve ser maior que zero" }),
    })
});