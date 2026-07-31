import { UserNotFoundError } from "../../exceptions/UserErrors.js";
import prismaClient from "../../prisma/index.js";
class DetailUserService {
    async execute(user_id) {
        const user = await prismaClient.user.findFirst({
            where: {
                id: user_id
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });
        if (!user) {
            throw new UserNotFoundError();
        }
        return user;
    }
}
export { DetailUserService };
//# sourceMappingURL=DetailUserService.js.map