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
        status: OrderStatus;
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
    } | {
        notice?: string;
        stock_restored: boolean;
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        status?: OrderStatus;
        subtotal?: number;
        discount?: number;
        shipping_cost?: number;
        total?: number;
        shipping_service?: string | null;
        shipping_delivery_days?: number | null;
        shipping_cost_estimated?: boolean;
        expires_at?: Date | null;
        delivery_method?: import("../../generated/prisma/enums.js").DeliveryMethod;
        user_id?: string;
        address_id?: string | null;
        coupon_id?: string | null;
    } | null>;
}
export { UpdateOrderStatusService };
//# sourceMappingURL=UpdateOrderStatusService.d.ts.map