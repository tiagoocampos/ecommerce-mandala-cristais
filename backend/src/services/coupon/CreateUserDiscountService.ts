import { UserNotFoundError } from "../../exceptions/UserErrors.js";
import prismaClient from "../../prisma/index.js";
import { parseExpiresAt } from "../../utils/parseExpiresAt.js";
import { generatePersonalCouponCode } from "./generateCouponCode.js";

interface CreateUserDiscountServiceProps {
    user_id: string;
    type: "PERCENTAGE" | "FIXED";
    value: number;
    expires_at?: string | null;
}

// Cupom exclusivo de um usuário, com código gerado automaticamente.
class CreateUserDiscountService {
    async execute({ user_id, type, value, expires_at }: CreateUserDiscountServiceProps) {
        const user = await prismaClient.user.findUnique({
            where: { id: user_id },
            select: { id: true, name: true },
        });

        if (!user) {
            throw new UserNotFoundError();
        }

        const code = await generatePersonalCouponCode(user.name);

        return prismaClient.coupon.create({
            data: {
                code,
                type,
                value,
                active: true,
                expires_at: parseExpiresAt(expires_at),
                user_id: user.id,
            },
        });
    }
}

export { CreateUserDiscountService };
