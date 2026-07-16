import { CreateOrderError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateOrderServiceProps {
  table: number;
  name: string;
}

class CreateOrderService {
  async execute({ table, name }: CreateOrderServiceProps) {
    try{
      const order = await prismaClient.order.create({
      data: {
        table: table,
        name: name ?? "",
      },
      select: {
        id: true,
        table: true,
        status: true,
        draft: true,
        name: true,
        createdAt: true,
      },
    });

    return order;
    }catch(error){
        throw new CreateOrderError();
    }
  }
}

export { CreateOrderService };

