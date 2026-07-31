interface CreatePreferenceServiceProps {
    order_id: string;
    user_id: string;
}
declare class CreatePreferenceService {
    execute({ order_id, user_id }: CreatePreferenceServiceProps): Promise<{
        order_id: string;
        checkout_url: string | undefined;
    }>;
}
export { CreatePreferenceService };
//# sourceMappingURL=CreatePreferenceService.d.ts.map