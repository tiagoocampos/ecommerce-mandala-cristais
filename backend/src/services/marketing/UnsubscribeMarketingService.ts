import { InvalidUnsubscribeTokenError } from "../../exceptions/EmailErrors.js";
import prismaClient from "../../prisma/index.js";
import { readUnsubscribeToken } from "./unsubscribeToken.js";

class UnsubscribeMarketingService {
    async execute({ token }: { token: string }) {
        const userId = readUnsubscribeToken(token);
        if (!userId) {
            throw new InvalidUnsubscribeTokenError();
        }

        // updateMany: não falha se o usuário tiver sido removido depois do envio
        await prismaClient.user.updateMany({
            where: { id: userId },
            data: { marketing_opt_out: true },
        });

        return { message: "Pronto! Você não vai mais receber e-mails de ofertas da Mandala Crystais." };
    }
}

export { UnsubscribeMarketingService };
