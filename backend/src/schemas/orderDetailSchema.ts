import { z } from "zod";

export const OrderDetailSchema = z.object({
  query: z.object({
    order_id: z
      .string({ message: "O order_id deve ser informado" })
      .min(1, { message: "O order_id deve ser informado" }),
  }),
});


