import prismaClient from "../../prisma/index.js";

// Só cupons genéricos; os pessoais aparecem no detalhe de cada usuário.
class ListCouponsAdminService {
    async execute() {
        return prismaClient.coupon.findMany({
            where: { user_id: null },
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { orders: true } } },
        });
    }
}

export { ListCouponsAdminService };
