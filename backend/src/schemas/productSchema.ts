import { z } from "zod";

export const createProductSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "O nome do produto deve ser um texto" })
            .min(1, { message: "O nome do produto é obrigatório" }),
        description: z
            .string()
            .min(1, { message: "A descrição do produto é obrigatória" }),
        price: z
            .string()
            .min(1, { message: "O preço do produto é obrigatório" })
            .regex(/^\d+$/, { message: "O preço do produto deve ser um número" }),
        promo_price: z
            .string()
            .regex(/^\d+$/, { message: "O preço promocional deve ser um número" })
            .optional(),
        stock: z
            .string()
            .min(1, { message: "O estoque do produto é obrigatório" })
            .regex(/^\d+$/, { message: "O estoque deve ser um número" }),
        category_id: z
            .string()
            .min(1, { message: "A categoria do produto é obrigatória" }),
    }).refine(
        (data) => {
            if (!data.promo_price) return true;
            return Number(data.promo_price) < Number(data.price);
        },
        {
            message: "O preço promocional deve ser menor que o preço normal",
            path: ["promo_price"],
        }
    )
});

export const listProductsSchema = z.object({
    query: z.object({
        disabled: z
            .string()
            .optional()
    }),
});

export const listProductsByCategorySchema = z.object({
    query: z.object({
        category_id: z
            .string({ message: "O id da categoria é obrigatório" })
            .min(1, { message: "A categoria do produto é obrigatória" }),
    }),
});

//criar schema para o update de um produto, usando casos opcionais e refines

export const updateProductSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "O nome do produto deve ser um texto" })
            .min(1, { message: "O nome do produto é obrigatório" })
            .optional(),
        description: z
            .string({ message: "A descrição do produto deve ser um texto" })
            .min(1, { message: "A descrição do produto é obrigatória" })
            .optional(),
        price: z
            .string({ message: "O preço do produto deve ser um número" })
            .min(1, { message: "O preço do produto é obrigatório" })
            .regex(/^\d+$/, { message: "O preço do produto deve ser um número" })
            .optional(),
        promo_price: z
            .string({ message: "O preço promocional deve ser um número" })
            .regex(/^\d+$/, { message: "O preço promocional deve ser um número" })
            .optional(),
        stock: z
            .string({ message: "O estoque do produto deve ser um número" })
            .min(1, { message: "O estoque do produto é obrigatório" })
            .regex(/^\d+$/, { message: "O estoque do produto deve ser um número" })
            .optional(),
        category_id: z
            .string({ message: "A categoria do produto deve ser um texto" })
            .min(1, { message: "A categoria do produto é obrigatória" })
            .optional(),
    }).refine(
        (data) => {
            if (!data.promo_price) return true;
            return Number(data.promo_price) < Number(data.price);
        },
        {
            message: "O preço promocional deve ser menor que o preço normal",
            path: ["promo_price"],
        }
    )
});