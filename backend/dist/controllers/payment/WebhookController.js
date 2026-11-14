import { WebhookService } from "../../services/payment/WebhookService.js";
class WebhookController {
    async handle(req, res) {
        try {
            // Descartável (tópico não tratado, pagamento 404, pedido inexistente...) → 200 também,
            // senão o Mercado Pago repetiria em vão (a cada 15 min, conforme a doc).
            const result = await new WebhookService().execute(req.body);
            return res.status(200).json({ ok: true, handled: result.handled });
        }
        catch (error) {
            // Transitório (banco fora, rede, 5xx do MP): 5xx para o Mercado Pago repetir.
            // Loga só a mensagem — nunca o corpo da notificação.
            console.error("[webhook] falha transitória:", error instanceof Error ? error.message : "erro desconhecido");
            return res.status(500).json({ ok: false, message: "Erro ao processar webhook." });
        }
    }
}
export { WebhookController };
//# sourceMappingURL=WebhookController.js.map