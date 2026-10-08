interface GetOrderServiceProps {
    user_id: string;
    order_id: string;
}
declare class GetOrderService {
    execute({ user_id, order_id }: GetOrderServiceProps): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expires_at: Date | null;
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
    }) | null>;
}
export { GetOrderService };
//# sourceMappingURL=GetOrderService.d.ts.map