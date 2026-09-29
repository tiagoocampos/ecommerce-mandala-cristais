import type { Address, OrderStatus } from "./index";

export type CouponType = "PERCENTAGE" | "FIXED";
export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | "REFUNDED";

export interface Coupon {
    id: string;
    code: string;
    type: CouponType;
    /** PERCENTAGE: 1..100 | FIXED: centavos */
    value: number;
    active: boolean;
    first_purchase_only?: boolean;
    expires_at: string | null;
    createdAt: string;
    _count?: { orders: number };
}

export interface AdminUserListItem {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: "CUSTOMER" | "ADMIN";
    createdAt: string;
    _count: { orders: number };
}

export interface AdminUserOrder {
    id: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    payment: { status: PaymentStatus; method: string | null } | null;
    itemsCount: number;
}

export interface AdminUserDetail {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: "CUSTOMER" | "ADMIN";
    createdAt: string;
    addresses: Address[];
    stats: {
        ordersCount: number;
        totalSpent: number;
        pendingPaymentsCount: number;
    };
    orders: AdminUserOrder[];
    coupons: Coupon[];
}

export interface AdminDashboard {
    revenue: { paidTotal: number };
    ordersByStatus: Record<OrderStatus, number>;
    pendingPayments: { count: number };
    lowStockProducts: { id: string; name: string; slug: string; stock: number }[];
    newUsersLast30Days: number;
    actionOrders: {
        id: string;
        status: OrderStatus;
        total: number;
        createdAt: string;
        user: { id: string; name: string; email: string };
        payment: { status: PaymentStatus } | null;
    }[];
}

export interface TrustStripItemData {
    icon: string;
    label: string;
}

export interface StoreSettings {
    announcement_text: string;
    announcement_coupon_code: string | null;
    /** centavos */
    free_shipping_threshold: number | null;
    trust_strip_items: TrustStripItemData[];
}
