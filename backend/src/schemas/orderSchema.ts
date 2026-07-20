import { z } from "zod";

export const createOrderSchema = z.object({
  body: z.object({
    address_id: z.string({
      message: "O address_id deve ser um texto"
    }).uuid({
      message: "O address_id deve ser um UUID válido"
    }),
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

export const getOrderSchema = z.object({
  params: z.object({
    order_id: z.string({ message: "O order_id deve ser um texto" }),
  }),
});


