import { CouponNotFoundError } from "../../exceptions/CouponErrors.js";
import prismaClient from "../../prisma/index.js";

// Desativar só impede uso futuro; pedidos já feitos com o cupom não mudam.
class UpdateCouponStatusService {
    async execute({ id, active }: { id: string; active: boolean }) {
        const coupon = await prismaClient.coupon.findUnique({ where: { id }, select: { id: true } });
        if (!coupon) {
            throw new CouponNotFoundError();
        }

        return prismaClient.coupon.update({
            where: { id },
            data: { active },
        });
    }
}

export { UpdateCouponStatusService };
