import { CouponAlreadyExistsError, CouponNotFoundError, InvalidCouponError } from "../../exceptions/CouponErrors.js";
import { Prisma } from "../../generated/prisma/client.js";
import prismaClient from "../../prisma/index.js";
import { parseExpiresAt } from "../../utils/parseExpiresAt.js";

interface EditCouponAdminServiceProps {
    id: string;
    code?: string | null | undefined;
    type?: "PERCENTAGE" | "FIXED" | undefined;
    value?: number | null | undefined;
    first_purchase_only?: boolean | null | undefined;

    expires_at?: string | null | undefined;
}


class EditCouponAdminService {
    async execute({ id, code: rawCode, type, value, first_purchase_only, expires_at }: EditCouponAdminServiceProps) {
        const coupon = await prismaClient.coupon.findUnique({ where: { id } });
        if (!coupon) {
            throw new CouponNotFoundError();
        }

        const data: Prisma.CouponUpdateInput = {};

        if (rawCode != null) {
            const code = rawCode.trim().toUpperCase();
            if (code !== coupon.code) {
                const exists = await prismaClient.coupon.findUnique({ where: { code }, select: { id: true } });
                if (exists) {
                    throw new CouponAlreadyExistsError();
                }
                data.code = code;
            }
        }
        // o schema só valida type+value quando os dois vêm juntos; aqui cruza com o que já está no banco
        const finalType = type ?? coupon.type;
        const finalValue = value ?? coupon.value;
        if (finalType === "PERCENTAGE" && (finalValue < 1 || finalValue > 100)) {
            throw new InvalidCouponError("Percentual deve estar entre 1 e 100");
        }
        if (finalType === "FIXED" && finalValue < 1) {
            throw new InvalidCouponError("Valor do desconto deve ser maior que zero");
        }

        if (type !== undefined) data.type = type;
        if (value != null) data.value = value;
        if (first_purchase_only != null) data.first_purchase_only = first_purchase_only;
        if (expires_at !== undefined) data.expires_at = parseExpiresAt(expires_at);

        try {
            return await prismaClient.coupon.update({ where: { id }, data });
        } catch (error) {
            // corrida entre a checagem acima e o update
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
                throw new CouponAlreadyExistsError();
            }
            throw error;
        }
    }
}

export { EditCouponAdminService };
