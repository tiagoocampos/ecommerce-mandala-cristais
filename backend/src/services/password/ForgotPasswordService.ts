import { brevo } from "../../config/brevo.js";
import prismaClient from "../../prisma/index.js";
import { button, escapeHtml, frontendUrl, renderEmail } from "../../utils/emailTemplate.js";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "./resetToken.js";

// Evita spam: se um link foi pedido há menos de 2 minutos, não manda outro
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;

// Resposta SEMPRE igual, exista ou não o e-mail (não revela quem tem cadastro)
export const FORGOT_PASSWORD_MESSAGE =
    "Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha em instantes.";

class ForgotPasswordService {
    async execute({ email }: { email: string }) {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await prismaClient.user.findFirst({
            where: { email: { equals: normalizedEmail, mode: "insensitive" } },
            select: { id: true, name: true, email: true, reset_password_expires_at: true },
        });

        if (!user) {
            return { message: FORGOT_PASSWORD_MESSAGE };
        }

        const issuedAt = user.reset_password_expires_at
            ? user.reset_password_expires_at.getTime() - RESET_TOKEN_TTL_MS
            : 0;
        if (Date.now() - issuedAt < RESEND_COOLDOWN_MS) {
            return { message: FORGOT_PASSWORD_MESSAGE };
        }

        const { token, tokenHash } = generateResetToken();
        await prismaClient.user.update({
            where: { id: user.id },
            data: {
                reset_password_token: tokenHash, // só o hash vai para o banco
                reset_password_expires_at: new Date(Date.now() + RESET_TOKEN_TTL_MS),
            },
        });

        const link = frontendUrl(`/redefinir-senha?token=${token}`);
        const firstName = user.name.trim().split(/\s+/)[0] ?? "";

        try {
            await brevo.sendEmail({
                to: { email: user.email, name: user.name },
                subject: "Redefinição de senha — Mandala Crystais",
                html: renderEmail({
                    title: "Redefinir sua senha",
                    bodyHtml: `
                        <p style="margin:0 0 16px">Olá${firstName ? `, ${escapeHtml(firstName)}` : ""}!</p>
                        <p style="margin:0 0 24px">Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha. O link vale por 1 hora.</p>
                        <p style="margin:0 0 24px">${button("Criar nova senha", link)}</p>
                        <p style="margin:0;font-size:13px;color:#6e5a6b">Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.</p>`,
                }),
            });
        } catch (error) {
            // Não vaza a falha para quem pediu (resposta genérica); fica registrado no servidor
            console.error("[senha] Falha ao enviar e-mail de redefinição:", error);
        }

        return { message: FORGOT_PASSWORD_MESSAGE };
    }
}

export { ForgotPasswordService };
