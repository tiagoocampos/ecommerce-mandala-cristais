import { z } from "zod";

export const sendMarketingSchema = z.object({
    body: z.object({
        subject: z.string({ message: "Informe o assunto" }).trim().min(1, { message: "Informe o assunto" }).max(150),
        message: z.string({ message: "Escreva a mensagem" }).trim().min(1, { message: "Escreva a mensagem" }).max(10_000),
        user_ids: z
            .array(z.string().min(1), { message: "Selecione os clientes" })
            .min(1, { message: "Selecione pelo menos um cliente" })
            .max(5000),
    }),
});

export const unsubscribeSchema = z.object({
    body: z.object({
        token: z.string({ message: "Link de descadastro inválido" }).min(10, { message: "Link de descadastro inválido" }),
    }),
});
