import prismaClient from "../../../prisma/index.js";
import { UserNotFoundError } from "../../../exceptions/UserErrors.js";

class DeleteUserAdminService {
  async execute({ id }: { id: string }) {
    const user = await prismaClient.user.findFirst({ where: { id } });
    if (!user) {
      throw new UserNotFoundError();
    }

    await prismaClient.user.delete({ where: { id } });

    return { message: "Usuário deletado com sucesso" };
  }
}

export { DeleteUserAdminService };

