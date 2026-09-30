interface GetOrderAdminServiceProps {
    order_id: string;
}
declare class GetOrderAdminService {
    execute({ order_id }: GetOrderAdminServiceProps): Promise<{
        user: {
            name: string;
            email: string;
            phone: string | null;
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
            number: string;
            id: string;
            createdAt: Date;
            user_id: string;
            state: string;
            street: string;
            complement: string | null;
            neighborhood: string;
            city: string;
            zip_code: string;
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
    }>;
}
export { GetOrderAdminService };
//# sourceMappingURL=GetOrderAdminService.d.ts.map