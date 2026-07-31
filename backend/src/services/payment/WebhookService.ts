class WebhookService {
    async execute(body: any) {
        console.log("===== WEBHOOK RECEBIDO =====");
        console.log(JSON.stringify(body, null, 2));
    }
}

export { WebhookService };