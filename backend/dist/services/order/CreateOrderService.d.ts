export declare const PICKUP_SERVICE_LABEL = "Retirada na loja";
interface CreateOrderServiceProps {
    user_id: string;
    /** padrão SHIPPING; PICKUP ignora address_id/shipping_service */
    delivery_method?: "SHIPPING" | "PICKUP";
    address_id?: string;
    coupon_code?: string;
    /** nome do serviço escolhido no checkout, ex.: "PAC" */
    shipping_service?: string;
    /** último preço cotado na tela — usado SÓ se o Melhor Envio cair na hora de finalizar */
    shipping_quote_cents?: number;
}
declare class CreateOrderService {
    execute({ user_id, delivery_method, address_id, coupon_code, shipping_service, shipping_quote_cents }: CreateOrderServiceProps): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("../../generated/prisma/enums.js").PaymentStatus;
            order_id: string;
            method: string | null;
            provider: string;
            provider_payment_id: string | null;
            raw_payload: import("@prisma/client/runtime/client").JsonValue | null;
            discount_amount: number;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("../../generated/prisma/enums.js").OrderStatus;
        subtotal: number;
        discount: number;
        shipping_cost: number;
        total: number;
        shipping_service: string | null;
        shipping_delivery_days: number | null;
        shipping_cost_estimated: boolean;
        expires_at: Date | null;
        delivery_method: import("../../generated/prisma/enums.js").DeliveryMethod;
        user_id: string;
        address_id: string | null;
        coupon_id: string | null;
    }>;
}
export { CreateOrderService };
//# sourceMappingURL=CreateOrderService.d.ts.map