import { z } from "zod";
import { passwordField } from "./userSchema.js";

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.email({ message: "Informe um e-mail válido" }),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        token: z.string({ message: "Link inválido" }).regex(/^[a-f0-9]{64}$/, { message: "Link inválido ou expirado. Solicite um novo." }),
        new_password: passwordField,
    }),
});
