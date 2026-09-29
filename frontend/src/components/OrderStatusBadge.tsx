import { cn } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/order-status";
import type { OrderStatus } from "../types";

const STATUS_STYLES: Record<OrderStatus, { badge: string; dot: string }> = {
    PENDING: { badge: "bg-mc-gold-500/20 text-mc-gold-800 border-mc-gold-500/50", dot: "bg-mc-gold-500" },
    PAID: { badge: "bg-mc-blush-100 text-mc-violet-700 border-mc-blush-200", dot: "bg-mc-violet-500" },
    SHIPPED: { badge: "bg-mc-violet-700 text-white border-mc-violet-700", dot: "bg-mc-gold-400" },
    DELIVERED: { badge: "bg-mc-success-100 text-mc-success-700 border-mc-success-700/25", dot: "bg-mc-success-700" },
    CANCELED: { badge: "bg-destructive/10 text-destructive border-destructive/25", dot: "bg-destructive" },
};

interface OrderStatusBadgeProps {
    status: OrderStatus;
    size?: "sm" | "md";
    className?: string;
}

export function OrderStatusBadge({ status, size = "sm", className }: OrderStatusBadgeProps) {
    const style = STATUS_STYLES[status];
    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
                size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
                style.badge,
                className
            )}
        >
            <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden="true" />
            {ORDER_STATUS_LABELS[status]}
        </span>
    );
}
