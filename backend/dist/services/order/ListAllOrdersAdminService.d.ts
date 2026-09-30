declare class ListAllOrdersAdminService {
    execute(): Promise<({
        user: {
            name: string;
            email: string;
            id: string;
        };
        items: ({
            product: {
                name: string;
                id: string;
                banner: string;
            };
        } & {
            id: string;
            product_id: string;
            quantity: number;
            unit_price: number;
            order_id: string;
        })[];
        address: {
            state: string;
            city: string;
        };
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
    })[]>;
}
export { ListAllOrdersAdminService };
//# sourceMappingURL=ListAllOrdersAdminService.d.ts.map