// Envio de e-mail pela API REST da Brevo — https://developers.brevo.com/reference/send-transac-email
// POST https://api.brevo.com/v3/smtp/email, header `api-key`.
// API key em Brevo → SMTP & API → API Keys. O remetente precisa estar verificado na conta.

import { EmailUnavailableError } from "../exceptions/EmailErrors.js";

const ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT_MS = 20_000;

// Limites da doc: até 2000 destinatários por requisição e 99 por versão. Usamos lotes
// bem menores (1 destinatário por versão, 50 versões por requisição) para manter o
// payload pequeno — cada versão leva o HTML com o link de descadastro daquele cliente.
const VERSIONS_PER_REQUEST = 50;

type Recipient = { email: string; name?: string };

function config() {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    if (!apiKey || !senderEmail) {
        throw new EmailUnavailableError();
    }
    return {
        apiKey,
        sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "Mandala Crystais" },
    };
}

async function post(body: Record<string, unknown>) {
    const { apiKey, sender } = config();
    const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ sender, ...body }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Brevo respondeu ${response.status}: ${text.slice(0, 300)}`);
    }
    return response.json().catch(() => ({}));
}

// Nome vai no cabeçalho "Para:" — a doc limita a 70 caracteres
const recipient = ({ email, name }: Recipient) => ({ email, ...(name && { name: name.slice(0, 70) }) });

/** E-mail individual (ex.: redefinição de senha). */
async function sendEmail({ to, subject, html }: { to: Recipient; subject: string; html: string }) {
    return post({ to: [recipient(to)], subject, htmlContent: html });
}

/**
 * Envio em lote: cada destinatário recebe o próprio HTML (via messageVersions), em
 * requisições de até 50 destinatários, uma após a outra (sem disparar centenas de
 * requisições em paralelo). Não interrompe no primeiro erro: devolve quantos foram e quantos falharam.
 */
async function sendBatch({ subject, messages }: { subject: string; messages: { to: Recipient; html: string }[] }) {
    config(); // falha cedo se não estiver configurado
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < messages.length; i += VERSIONS_PER_REQUEST) {
        const chunk = messages.slice(i, i + VERSIONS_PER_REQUEST);
        try {
            await post({
                subject,
                // htmlContent global é obrigatório para poder personalizar por versão
                htmlContent: chunk[0]!.html,
                messageVersions: chunk.map(({ to, html }) => ({ to: [recipient(to)], htmlContent: html })),
            });
            sent += chunk.length;
        } catch (error) {
            console.error(`[brevo] Falha no lote ${i / VERSIONS_PER_REQUEST + 1}:`, error);
            failed += chunk.length;
        }
    }

    return { sent, failed };
}

const brevo = { sendEmail, sendBatch };

export { brevo };
