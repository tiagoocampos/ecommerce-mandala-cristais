import { ForbiddenError, UserNotFoundError } from "../exceptions/UserErrors.js";
import prismaClient from "../prisma/index.js";
export const isAdmin = async (req, res, next) => {
    const user_id = req.user_id;
    if (!user_id) {
        throw new UserNotFoundError();
    }
    const user = await prismaClient.user.findFirst({
        where: {
            id: user_id
        },
        select: {
            role: true
        }
    });
    if (user?.role !== "ADMIN") {
        throw new ForbiddenError();
    }
    return next();
};
//# sourceMappingURL=IsAdmin.js.map