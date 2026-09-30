import { brevo } from "../../config/brevo.js";
import { NoRecipientsError } from "../../exceptions/EmailErrors.js";
import prismaClient from "../../prisma/index.js";
import { escapeHtml, frontendUrl, renderEmail, textToHtml } from "../../utils/emailTemplate.js";
import { createUnsubscribeToken } from "./unsubscribeToken.js";

interface SendMarketingEmailServiceProps {
    subject: string;
    message: string;
    user_ids: string[];
}

class SendMarketingEmailService {
    async execute({ subject, message, user_ids }: SendMarketingEmailServiceProps) {
        const uniqueIds = [...new Set(user_ids)];

        // Filtro no BACKEND: quem se descadastrou nunca recebe, mesmo se selecionado no admin
        const users = await prismaClient.user.findMany({
            where: { id: { in: uniqueIds }, marketing_opt_out: false },
            select: { id: true, name: true, email: true },
        });

        const skipped = uniqueIds.length - users.length;
        if (users.length === 0) {
            throw new NoRecipientsError();
        }

        const bodyHtml = textToHtml(message);
        const messages = users.map((user) => {
            const unsubscribeUrl = frontendUrl(`/descadastrar?token=${encodeURIComponent(createUnsubscribeToken(user.id))}`);
            return {
                to: { email: user.email, name: user.name },
                html: renderEmail({
                    title: subject,
                    bodyHtml,
                    // Link de descadastro obrigatório em todo e-mail de oferta (LGPD)
                    footerHtml: `Você recebeu este e-mail porque tem cadastro na nossa loja. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#5e2556">Não quero mais receber ofertas</a>.`,
                }),
            };
        });

        const { sent, failed } = await brevo.sendBatch({ subject, messages });

        return {
            requested: uniqueIds.length,
            skipped_opted_out_or_missing: skipped,
            sent,
            failed,
        };
    }
}

export { SendMarketingEmailService };
