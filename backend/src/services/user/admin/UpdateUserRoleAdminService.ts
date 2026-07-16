import prismaClient from "../../../prisma/index.js";
import { UserNotFoundError } from "../../../exceptions/UserNotFoundError.js";

class UpdateUserRoleAdminService {
  async execute({ id, role }: { id: string; role: "STAFF" | "ADMIN" }) {
    const user = await prismaClient.user.findFirst({ where: { id } });
    if (!user) {
      throw new UserNotFoundError();
    }

    const updated = await prismaClient.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return updated;
  }
}

export { UpdateUserRoleAdminService };

