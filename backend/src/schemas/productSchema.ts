import { z } from "zod";

// Peso/dimensões para frete: strings numéricas (multipart/form-data), opcionais.
// String vazia = sem valor (na edição, limpa o campo).
const optionalPositiveIntString = (label: string) =>
    z
        .string()
        .regex(/^\d*$/, { message: `${label} deve ser um número inteiro` })
        .refine((value) => value === "" || Number(value) > 0, { message: `${label} deve ser maior que zero` })
        .optional();

const shippingFields = {
    weight_grams: optionalPositiveIntString("O peso (g)"),
    height_cm: optionalPositiveIntString("A altura (cm)"),
    width_cm: optionalPositiveIntString("A largura (cm)"),
    length_cm: optionalPositiveIntString("O comprimento (cm)"),
};

// Booleanos chegam como texto no multipart/form-data: "true" | "false"
const booleanString = (label: string) =>
    z.enum(["true", "false"], { message: `${label} deve ser true ou false` }).optional();

// SEO/acessibilidade: texto livre, opcional. String vazia = sem valor (na edição, limpa).
// Meta descrição acima de 160 caracteres é REJEITADA (não truncada): cortar em silêncio
// poderia deixar a frase quebrada no Google; o formulário do admin já limita o tamanho.
export const META_DESCRIPTION_MAX = 160;
const seoFields = {
    meta_description: z
        .string()
        .max(META_DESCRIPTION_MAX, { message: `A meta descrição deve ter no máximo ${META_DESCRIPTION_MAX} caracteres` })
        .optional(),
    image_alt_text: z
        .string()
        .max(250, { message: "O texto alternativo da imagem deve ter no máximo 250 caracteres" })
        .optional(),
};

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
        ...shippingFields,
        ...seoFields,
        // produto nasce ativo (sem `disabled` aqui), mas já pode nascer em destaque
        featured: booleanString("Destaque"),
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

export const productAIAssistSchema = z.object({
    body: z.object({
        name: z
            .string({ message: "Informe o nome do produto" })
            .trim()
            .min(1, { message: "Informe o nome do produto" })
            .max(150),
        category_hint: z.string().max(100).optional(),
        keywords: z.string().max(200).optional(),
    }),
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
        ...shippingFields,
        ...seoFields,
        // "false" reativa um produto arquivado
        disabled: booleanString("Arquivado"),
        featured: booleanString("Destaque"),
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