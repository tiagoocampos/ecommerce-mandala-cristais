import { Request, Response } from "express";
import { melhorenvio } from "../../config/melhorenvio.js";
import { InvalidOAuthStateError } from "../../exceptions/ShippingErrors.js";
import { createOAuthState, isValidOAuthState } from "../../services/integration/melhorEnvioOAuthState.js";

function escapeHtml(text: string) {
    return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function resultPage(title: string, message: string) {
    const adminUrl = `${(process.env.FRONTEND_URL ?? "").replace(/\/+$/, "")}/admin/vitrine`;
    return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body style="font-family:system-ui,sans-serif;max-width:480px;margin:15vh auto;padding:0 16px;color:#2a1427">
<h1 style="font-size:1.4rem;color:#5e2556">${escapeHtml(title)}</h1>
<p>${escapeHtml(message)}</p>
<p><a href="${escapeHtml(adminUrl)}" style="color:#843679">Voltar para o painel admin</a></p>
</body></html>`;
}

class MelhorEnvioIntegrationController {
    /** GET /admin/integrations/melhorenvio — status da conexão (admin) */
    async status(req: Request, res: Response) {
        return res.json(await melhorenvio.getStatus());
    }

    /** GET /admin/integrations/melhorenvio/authorize-url — link para o lojista autorizar o app (admin) */
    async authorizeUrl(req: Request, res: Response) {
        return res.json({ url: melhorenvio.getAuthorizeUrl(createOAuthState()) });
    }

    /** GET /integrations/melhorenvio/callback?code&state — retorno do Melhor Envio (público) */
    async callback(req: Request, res: Response) {
        const { code, state, error } = req.query as Record<string, string | undefined>;

        if (error) {
            return res.status(400).send(resultPage("Autorização cancelada", "O Melhor Envio não autorizou o aplicativo. Tente de novo pelo painel admin."));
        }
        if (!state || !isValidOAuthState(state)) {
            throw new InvalidOAuthStateError();
        }
        if (!code) {
            return res.status(400).send(resultPage("Autorização incompleta", "O Melhor Envio não enviou o código de autorização."));
        }

        try {
            await melhorenvio.exchangeCode(code);
        } catch (err) {
            console.error("[melhorenvio] Erro ao trocar code por token:", err);
            return res.status(502).send(resultPage("Não foi possível concluir", "Falha ao obter o token no Melhor Envio. Confira CLIENT_ID, CLIENT_SECRET e REDIRECT_URI e tente de novo."));
        }

        return res.send(resultPage("Melhor Envio conectado ✓", "Pronto! O cálculo de frete já pode usar a sua conta do Melhor Envio. O token é renovado automaticamente."));
    }
}

export { MelhorEnvioIntegrationController };
