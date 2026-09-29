import type { OrderStatus } from "../generated/prisma/client.js";

// Pedidos efetivamente pagos (entram em faturamento/total gasto)
export const PAID_ORDER_STATUSES: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];
