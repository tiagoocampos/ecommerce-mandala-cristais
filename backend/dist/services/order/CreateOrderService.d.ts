interface CreateOrderServiceProps {
    user_id: string;
    address_id: string;
    coupon_code?: string;
    /** nome do serviço escolhido no checkout, ex.: "PAC" */
    shipping_service: string;
    /** último preço cotado na tela — usado SÓ se o Melhor Envio cair na hora de finalizar */
    shipping_quote_cents?: number;
}
declare class CreateOrderService {
    execute({ user_id, address_id, coupon_code, shipping_service, shipping_quote_cents }: CreateOrderServiceProps): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            method: string | null;
            provider: string;
            status: import("../../generated/prisma/enums.js").PaymentStatus;
            provider_payment_id: string | null;
            raw_payload: import("@prisma/client/runtime/client").JsonValue | null;
            order_id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        subtotal: number;
        address_id: string;
        shipping_service: string | null;
        status: import("../../generated/prisma/enums.js").OrderStatus;
        discount: number;
        shipping_cost: number;
        total: number;
        shipping_delivery_days: number | null;
        shipping_cost_estimated: boolean;
        coupon_id: string | null;
    }>;
}
export { CreateOrderService };
//# sourceMappingURL=CreateOrderService.d.ts.map