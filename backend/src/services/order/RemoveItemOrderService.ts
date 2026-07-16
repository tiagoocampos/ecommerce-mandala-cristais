import prismaClient from "../../prisma/index.js";
import { ItemNotFoundError, RemoveItemError } from "../../exceptions/OrdersErrors.js";

interface RemoveItemOrderServiceProps {
  item_id: string;
}

class RemoveItemOrderService {
  async execute({ item_id }: RemoveItemOrderServiceProps) {
    try {
      const itemExists = await prismaClient.item.findFirst({
        where: { id: item_id },
      });

      if (!itemExists) {
        throw new ItemNotFoundError();
      }

      await prismaClient.item.delete({
        where: { id: item_id },
      });

      return { message: "Item removido com sucesso" };
    } catch (error) {
      if (error instanceof ItemNotFoundError) {
        console.log(error);
        throw error;
      }

      console.log(error);
      throw new RemoveItemError();
    }
  }
}

export { RemoveItemOrderService };

