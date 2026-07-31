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
            city: string;
            state: string;
        };
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
export { ListAllOrdersAdminService };
//# sourceMappingURL=ListAllOrdersAdminService.d.ts.map