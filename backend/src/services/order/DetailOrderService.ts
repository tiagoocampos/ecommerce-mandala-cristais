import prismaClient from "../../prisma/index.js";
import { ItemNotFoundError, OrderNotFoundError } from "../../exceptions/OrdersErrors.js";


interface DetailOrderServiceProps {
  order_id: string;
}

class DetailOrderService {
  async execute({ order_id }: DetailOrderServiceProps) {
    const order = await prismaClient.order.findFirst({
      where: { id: order_id },
      select: {
        id: true,
        table: true,
        status: true,
        draft: true,
        name: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            amount: true,
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                description: true,
                banner: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new OrderNotFoundError();
    }

    return order;
  }
}

export { DetailOrderService };

