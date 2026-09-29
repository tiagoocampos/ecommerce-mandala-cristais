import type { OrderStatus } from "../../generated/prisma/client.js";
import prismaClient from "../../prisma/index.js";
import { PAID_ORDER_STATUSES } from "../../utils/orderStatus.js";

const LOW_STOCK_THRESHOLD = 5;
const TABLE_LIMIT = 20;

// Agregados do dashboard calculados no banco (sem trazer listas inteiras pro frontend).
class GetDashboardAdminService {
    async execute() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [revenue, ordersGrouped, pendingPaymentsCount, lowStockProducts, newUsersLast30Days, actionOrders] =
            await Promise.all([
                prismaClient.order.aggregate({
                    _sum: { total: true },
                    where: { status: { in: PAID_ORDER_STATUSES } },
                }),
                prismaClient.order.groupBy({
                    by: ["status"],
                    _count: { _all: true },
                }),
                prismaClient.payment.count({
                    where: { status: "PENDING" },
                }),
                prismaClient.product.findMany({
                    where: { stock: { lte: LOW_STOCK_THRESHOLD }, disabled: false },
                    orderBy: { stock: "asc" },
                    take: TABLE_LIMIT,
                    select: { id: true, name: true, slug: true, stock: true },
                }),
                prismaClient.user.count({
                    where: { createdAt: { gte: thirtyDaysAgo } },
                }),
                // Fila de trabalho: pedido pendente ou pagamento pendente (exceto cancelados), mais antigos primeiro
                prismaClient.order.findMany({
                    where: {
                        status: { not: "CANCELED" },
                        OR: [{ status: "PENDING" }, { payment: { status: "PENDING" } }],
                    },
                    orderBy: { createdAt: "asc" },
                    take: TABLE_LIMIT,
                    select: {
                        id: true,
                        status: true,
                        total: true,
                        createdAt: true,
                        user: { select: { id: true, name: true, email: true } },
                        payment: { select: { status: true } },
                    },
                }),
            ]);

        const ordersByStatus: Record<OrderStatus, number> = {
            PENDING: 0,
            PAID: 0,
            SHIPPED: 0,
            DELIVERED: 0,
            CANCELED: 0,
        };
        for (const group of ordersGrouped) {
            ordersByStatus[group.status] = group._count._all;
        }

        return {
            revenue: { paidTotal: revenue._sum.total ?? 0 },
            ordersByStatus,
            pendingPayments: { count: pendingPaymentsCount },
            lowStockProducts,
            newUsersLast30Days,
            actionOrders,
        };
    }
}

export { GetDashboardAdminService };
