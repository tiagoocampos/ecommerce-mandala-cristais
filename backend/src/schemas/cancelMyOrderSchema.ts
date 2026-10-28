import { z } from "zod";

export const cancelMyOrderSchema = z.object({
  params: z.object({
    id: z.string({ message: "O id do pedido deve ser informado" }).uuid({ message: "Id do pedido inválido" }),
  }),
});
