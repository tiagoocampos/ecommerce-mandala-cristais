import { UserNotFoundError } from "../../../exceptions/UserErrors.js";
import prismaClient from "../../../prisma/index.js";
import { PAID_ORDER_STATUSES } from "../../../utils/orderStatus.js";

interface GetUserAdminServiceProps {
    id: string;
}

class GetUserAdminService {
    async execute({ id }: GetUserAdminServiceProps) {
        const user = await prismaClient.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                addresses: {
                    orderBy: { createdAt: "desc" },
                },
                orders: {
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        status: true,
                        total: true,
                        createdAt: true,
                        payment: { select: { status: true, method: true } },
                        _count: { select: { items: true } },
                    },
                },
                coupons: {
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        code: true,
                        type: true,
                        value: true,
                        active: true,
                        expires_at: true,
                        createdAt: true,
                        _count: { select: { orders: true } },
                    },
                },
            },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        const { orders, ...rest } = user;

        const stats = {
            ordersCount: orders.length,
            totalSpent: orders
                .filter((order) => PAID_ORDER_STATUSES.includes(order.status))
                .reduce((sum, order) => sum + order.total, 0),
            pendingPaymentsCount: orders.filter((order) => order.payment?.status === "PENDING").length,
        };

        return {
            ...rest,
            stats,
            orders: orders.map(({ _count, ...order }) => ({
                ...order,
                itemsCount: _count.items,
            })),
        };
    }
}

export { GetUserAdminService };
