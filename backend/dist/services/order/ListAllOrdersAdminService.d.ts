declare class ListAllOrdersAdminService {
    execute(): Promise<({
        user: {
            name: string;
            email: string;
            id: string;
        };
        address: {
            state: string;
            city: string;
        } | null;
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
    })[]>;
}
export { ListAllOrdersAdminService };
//# sourceMappingURL=ListAllOrdersAdminService.d.ts.map