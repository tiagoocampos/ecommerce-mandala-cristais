import prismaClient from "../../../prisma/index.js";

class ListUsersAdminService {
  async execute() {
    const users = await prismaClient.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }
}

export { ListUsersAdminService };

