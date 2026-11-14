import { z } from "zod";
export const createOrderSchema = z.object({
    body: z
        .object({
        // SHIPPING é o padrão para não quebrar o frontend antigo
        delivery_method: z
            .enum(["SHIPPING", "PICKUP"], { message: "Forma de entrega inválida" })
            .default("SHIPPING"),
        address_id: z.string({ message: "O address_id deve ser um texto" }).optional(),
        coupon_code: z.string().trim().min(1).optional(),
        shipping_service: z.string().trim().optional(),
        // fallback: só é usado se o Melhor Envio estiver fora do ar ao finalizar
        shipping_quote_cents: z.number().int().positive().optional(),
    })
        .superRefine((body, ctx) => {
        // Endereço e frete só são exigidos na entrega; na retirada são ignorados
        if (body.delivery_method !== "SHIPPING")
            return;
        if (!body.address_id || !z.string().uuid().safeParse(body.address_id).success) {
            ctx.addIssue({ code: "custom", path: ["address_id"], message: "O address_id deve ser um UUID válido" });
        }
        if (!body.shipping_service) {
            ctx.addIssue({ code: "custom", path: ["shipping_service"], message: "Escolha uma opção de frete" });
        }
    }),
});
export const AddItemSchema = z.object({
    body: z.object({
        amount: z.number().int().positive(),
        order_id: z.string().min(1, { message: "A order_id deve ser informada" }),
        product_id: z
            .string()
            .min(1, { message: "O product_id deve ser informado" }),
    }),
});
export const RemoveItemSchema = z.object({
    query: z.object({
        item_id: z
            .string({ message: "O item_id deve ser uma string" })
            .min(1, { message: "item_id deve ser informado" }),
    }),
});
export const SendOrderSchema = z.object({
    body: z.object({
        order_id: z.string({ message: "O order_id deve ser um texto" }),
        name: z.string({ message: "O name deve ser informado" }),
    }),
});
export const FinishOrderSchema = z.object({
    body: z.object({
        order_id: z.string({ message: "O order_id deve ser um texto" }),
    }),
});
export const DeleteOrderSchema = z.object({
    query: z.object({
        order_id: z.string({ message: "O order_id deve ser um texto" }),
    }),
});
export const updateOrderStatusSchema = z.object({
    params: z.object({
        order_id: z.string().min(1),
    }),
    body: z.object({
        status: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELED"], {
            message: "Status inválido",
        }),
    }),
});
export const getOrderSchema = z.object({
    params: z.object({
        order_id: z.string({ message: "O order_id deve ser um texto" }),
    }),
});
//# sourceMappingURL=orderSchema.js.map