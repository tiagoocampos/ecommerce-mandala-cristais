interface CreateOrderServiceProps {
    user_id: string;
    address_id: string;
    coupon_code?: string;
}
declare class CreateOrderService {
    execute({ user_id, address_id, coupon_code }: CreateOrderServiceProps): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("../../generated/prisma/enums.js").PaymentStatus;
            provider: string;
            provider_payment_id: string | null;
            method: string | null;
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
        status: import("../../generated/prisma/enums.js").OrderStatus;
        discount: number;
        shipping_cost: number;
        total: number;
        coupon_id: string | null;
    }>;
}
export { CreateOrderService };
//# sourceMappingURL=CreateOrderService.d.ts.map