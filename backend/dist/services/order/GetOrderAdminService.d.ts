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
        } | null;
        payment: {
            status: import("../../generated/prisma/enums.js").PaymentStatus;
            method: string | null;
            discount_amount: number;
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
    }>;
}
export { GetOrderAdminService };
//# sourceMappingURL=GetOrderAdminService.d.ts.map