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
        address_id: string;
        status: OrderStatus;
        subtotal: number;
        discount: number;
        shipping_cost: number;
        total: number;
        coupon_id: string | null;
    }>;
}
export { UpdateOrderStatusService };
//# sourceMappingURL=UpdateOrderStatusService.d.ts.map