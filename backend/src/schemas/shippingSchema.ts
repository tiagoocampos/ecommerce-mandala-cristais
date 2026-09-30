import { z } from "zod";

export const shippingQuoteSchema = z.object({
  body: z.object({
    address_id: z
      .string({ message: "O address_id deve ser um texto" })
      .uuid({ message: "O address_id deve ser um UUID válido" }),
  }),
});
