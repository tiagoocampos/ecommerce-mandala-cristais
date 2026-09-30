import prismaClient from "../../../prisma/index.js";

class ListUsersAdminService {
  async execute() {
    const users = await prismaClient.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        marketing_opt_out: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }
}

export { ListUsersAdminService };
