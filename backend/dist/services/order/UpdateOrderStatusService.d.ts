import { OrderStatus } from "../../generated/prisma/enums.js";
interface UpdateOrderStatusServiceProps {
    order_id: string;
    status: OrderStatus;
}
export declare const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]>;
declare class UpdateOrderStatusService {
    execute({ order_id, status }: UpdateOrderStatusServiceProps): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        expires_at: Date | null;
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
    } | {
        notice?: string;
        stock_restored: boolean;
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        expires_at?: Date | null;
        user_id?: string;
        subtotal?: number;
        address_id?: string;
        shipping_service?: string | null;
        status?: OrderStatus;
        discount?: number;
        shipping_cost?: number;
        total?: number;
        shipping_delivery_days?: number | null;
        shipping_cost_estimated?: boolean;
        coupon_id?: string | null;
    } | null>;
}
export { UpdateOrderStatusService };
//# sourceMappingURL=UpdateOrderStatusService.d.ts.map