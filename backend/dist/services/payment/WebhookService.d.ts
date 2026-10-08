declare class WebhookService {
    execute(body: any): Promise<void>;
    private fetchFromPaymentTopic;
    private fetchFromMerchantOrderTopic;
    private applyPaymentInfo;
    private handleApproved;
}
export { WebhookService };
//# sourceMappingURL=WebhookService.d.ts.map