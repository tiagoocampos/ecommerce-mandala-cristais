interface ListOrdersServiceProps {
    user_id: string;
}
declare class ListOrdersService {
    execute({ user_id }: ListOrdersServiceProps): Promise<({
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
        user_id: string;
        address_id: string;
        status: import("../../generated/prisma/enums.js").OrderStatus;
        subtotal: number;
        discount: number;
        shipping_cost: number;
        total: number;
        coupon_id: string | null;
    })[]>;
}
export { ListOrdersService };
//# sourceMappingURL=ListOrdersService.d.ts.map