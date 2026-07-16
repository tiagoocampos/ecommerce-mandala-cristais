import { z } from "zod";

export const CreateOrderSchema = z.object({
  body: z.object({
    table: z.number({ message: "A mesa é obrigatória"}).int().positive(),
    name: z.string().min(1, { message: "O nome do cliente é obrigatório" }),
  }),
});

export const AddItemSchema = z.object({
  body: z.object({
    amount: z.number().int().positive(),
    order_id: z.string().min(1, { message: "A order_id deve ser informada" }),
    product_id: z.string().min(1, { message: "O product_id deve ser informado" }),
  })
})

export const RemoveItemSchema = z.object({
  query: z.object({
    item_id: z.string({ message: "O item_id deve ser uma string"}).min(1, { message: "item_id deve ser informado" }),
  })
})

export const SendOrderSchema = z.object({
  body: z.object({
    order_id: z
      .string({ message: "O order_id deve ser um texto" }),
    name: z
      .string({ message: "O name deve ser informado" })
  })
})

export const FinishOrderSchema = z.object({
  body: z.object({
    order_id: z
      .string({ message: "O order_id deve ser um texto" }),
  })
})

export const DeleteOrderSchema = z.object({
  query: z.object({
    order_id: z
      .string({ message: "O order_id deve ser um texto" }),
  })
})
