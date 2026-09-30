import { OrderStatus } from "../../generated/prisma/enums.js";
interface UpdateOrderStatusServiceProps {
    order_id: string;
    status: OrderStatus;
}
declare class UpdateOrderStatusService {
    execute({ order_id, status }: UpdateOrderStatusServiceProps): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
        subtotal: number;
        address_id: string;
        shipping_service: string | null;
        status: OrderStatus;
        discount: number;
        shipping_cost: number;
        total: number;
        shipping_delivery_days: number | null;
        shipping_cost_estimated: boolean;
        coupon_id: string | null;
    }>;
}
export { UpdateOrderStatusService };
//# sourceMappingURL=UpdateOrderStatusService.d.ts.map