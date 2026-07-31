class WebhookController {
    async handle(req, res) {
        console.log("CHEGOU!");
        return res.status(200).json({
            ok: true
        });
    }
}
export { WebhookController };
//# sourceMappingURL=WebhookController.js.map