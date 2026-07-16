import { z } from "zod";

export const CreateProductSchema = z.object ({
    body: z.object({
        name: z
            .string( {message: "O nome do produto deve ser um texto"})
            .min(1, { message: "O nome do produto é obrigatório" }),
        description: z
            .string()
            .min(1, { message: "A descrição do produto é obrigatória" }),
        price: z
            .string()
            .min(1, { message: "O preço do produto é obrigatório" })
            .regex(/^\d+$/, { message: "O preço do produto deve ser um número" }),
        category_id: z
            .string()
            .min(1, { message: "A categoria do produto é obrigatória" })
        })

    })

export const ListProductsSchema = z.object({
  query: z
    .object({
      disabled: z
      .string()
      .optional()      
    }),
});

export const ListProductsByCategorySchema = z.object({
  query: z.object({
    category_id: z
      .string({ message: "O id da categoria é obrigatório" })
      .min(1, { message: "A categoria do produto é obrigatória" }),
  }),
});



