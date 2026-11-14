interface GetOrderServiceProps {
    user_id: string;
    order_id: string;
}
declare class GetOrderService {
    execute({ user_id, order_id }: GetOrderServiceProps): Promise<{
        can_cancel: boolean;
        payment: {
            status: import("../../generated/prisma/enums.js").PaymentStatus;
            method: string | null;
            discount_amount: number;
        } | null;
        items: ({
            product: {
                name: string;
                id: string;
                price: number;
                promo_price: number | null;
                banner: string;
            };
        } & {
            id: string;
            product_id: string;
            quantity: number;
            unit_price: number;
            order_id: string;
        })[];
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
    } | {
        can_cancel: boolean;
        pix_discount: number;
        pix_total: number;
        payment: {
            status: import("../../generated/prisma/enums.js").PaymentStatus;
            method: string | null;
            discount_amount: number;
        } | null;
        items: ({
            product: {
                name: string;
                id: string;
                price: number;
                promo_price: number | null;
                banner: string;
            };
        } & {
            id: string;
            product_id: string;
            quantity: number;
            unit_price: number;
            order_id: string;
        })[];
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
    } | null>;
}
export { GetOrderService };
//# sourceMappingURL=GetOrderService.d.ts.map