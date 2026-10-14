import { CouponNotFoundError } from "../../exceptions/CouponErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteCouponProps {
    id: string;
}

class DeleteCouponService {
    async execute({ id }: DeleteCouponProps) {
        const couponExists = await prismaClient.coupon.findFirst({
            where: {
                id: id
            }
        });

        if (!couponExists) {
            throw new CouponNotFoundError();
        }

        await prismaClient.coupon.delete({
            where: {
                id: id
            }
        });

        return { message: "Cupom deletado com sucesso" };
    }
}

export { DeleteCouponService };