import { z } from "zod";

export const createAddressSchema = z.object({
    body: z.object({
        street: z
            .string({ message: "A rua deve ser do tipo texto" })
            .min(3, { message: "Informe a rua" }),
        number: z
            .string({ message: "O número deve ser do tipo texto" })
            .min(1, { message: "Informe o número" }),
        complement: z
            .string()
            .optional(),
        neighborhood: z
            .string({ message: "O bairro deve ser do tipo texto" })
            .min(2, { message: "Informe o bairro" }),
        city: z
            .string({ message: "A cidade deve ser do tipo texto" })
            .min(2, { message: "Informe a cidade" }),
        state: z
            .string({ message: "O estado deve ser do tipo texto" })
            .length(2, { message: "Use a sigla do estado (ex: RS)" }),
        zip_code: z
            .string({ message: "O CEP deve ser do tipo texto" })
            .min(8, { message: "Informe um CEP válido" })
            .max(9, { message: "Informe um CEP válido" }),
    })
});

export const deleteAddressSchema = z.object({
    query: z.object({
        address_id: z
            .string({ message: "O address_id deve ser um texto" })
            .min(1, { message: "O address_id deve ser informado" }),
    })
})

export const updateAddressSchema = z.object({
    body: z.object({
        street: z
            .string({ message: "A rua deve ser do tipo texto" })
            .min(3, { message: "Informe a rua" })
            .optional(),
        number: z
            .string({ message: "O número deve ser do tipo texto" })
            .min(1, { message: "Informe o número" })
            .optional(),
        complement: z
            .string()
            .optional(),
        neighborhood: z
            .string({ message: "O bairro deve ser do tipo texto" })
            .min(2, { message: "Informe o bairro" })
            .optional(),
        city: z
            .string({ message: "A cidade deve ser do tipo texto" })
            .min(2, { message: "Informe a cidade" })
            .optional(),
        state: z
            .string({ message: "O estado deve ser do tipo texto" })
            .length(2, { message: "Use a sigla do estado (ex: RS)" })
            .optional(),
        zip_code: z
            .string({ message: "O CEP deve ser do tipo texto" })
            .min(8, { message: "Informe um CEP válido" })
            .max(9, { message: "Informe um CEP válido" })
            .optional(),
    }),
    query: z.object({
        address_id: z
            .string({ message: "O address_id deve ser um texto" })
            .min(1, { message: "O address_id deve ser informado" }),
    })
});