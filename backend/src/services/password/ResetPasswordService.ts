import { hash } from "bcrypt";
import { InvalidResetTokenError } from "../../exceptions/EmailErrors.js";
import prismaClient from "../../prisma/index.js";
import { hashResetToken } from "./resetToken.js";

class ResetPasswordService {
    async execute({ token, new_password }: { token: string; new_password: string }) {
        const user = await prismaClient.user.findFirst({
            where: {
                reset_password_token: hashResetToken(token),
                reset_password_expires_at: { gt: new Date() },
            },
            select: { id: true },
        });

        // token errado, expirado ou já usado → mesma mensagem genérica
        if (!user) {
            throw new InvalidResetTokenError();
        }

        // mesmo custo do bcrypt usado no cadastro (CreateUserService)
        const passwordHash = await hash(new_password, 8);

        await prismaClient.user.update({
            where: { id: user.id },
            data: {
                password: passwordHash,
                // token de uso único: invalida depois de usar
                reset_password_token: null,
                reset_password_expires_at: null,
            },
        });

        return { message: "Senha redefinida com sucesso. Você já pode entrar com a nova senha." };
    }
}

export { ResetPasswordService };
