import { CouponAlreadyExistsError } from "../../exceptions/CouponErrors.js";
import { Prisma } from "../../generated/prisma/client.js";
import prismaClient from "../../prisma/index.js";
import { parseExpiresAt } from "../../utils/parseExpiresAt.js";

interface CreateCouponAdminServiceProps {
    code: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    first_purchase_only?: boolean;
    expires_at?: string | null;
}

// Cupom genérico (sem usuário vinculado), com código escolhido pelo admin.
class CreateCouponAdminService {
    async execute({ code: rawCode, type, value, first_purchase_only, expires_at }: CreateCouponAdminServiceProps) {
        const code = rawCode.trim().toUpperCase();
        const exists = await prismaClient.coupon.findUnique({ where: { code }, select: { id: true } });
        if (exists) {
            throw new CouponAlreadyExistsError();
        }

        try {
            return await prismaClient.coupon.create({
                data: {
                    code,
                    type,
                    value,
                    first_purchase_only: first_purchase_only ?? false,
                    expires_at: parseExpiresAt(expires_at),
                    active: true,
                    user_id: null,
                },
            });
        } catch (error) {
            // corrida entre a checagem acima e o insert
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new CouponAlreadyExistsError();
            }
            throw error;
        }
    }
}

export { CreateCouponAdminService };
