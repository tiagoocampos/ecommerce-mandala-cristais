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
            street: string;
            complement: string | null;
            neighborhood: string;
            city: string;
            state: string;
            zip_code: string;
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
    }>;
}
export { GetOrderAdminService };
//# sourceMappingURL=GetOrderAdminService.d.ts.map