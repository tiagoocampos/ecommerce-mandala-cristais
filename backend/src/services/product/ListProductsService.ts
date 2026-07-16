import prismaClient from "../../prisma/index.js";
import { ListProductsError } from "../../exceptions/ProductErrors.js";

interface ListProductsServiceProps {
  disabled?: string;
}

class ListProductsService {
  async execute({ disabled }: ListProductsServiceProps) {
    try {
      const products = await prismaClient.product.findMany({
        where: {
          disabled: disabled === "true" ? true : false,
        },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          banner: true,
          disabled: true,
          category_id: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return products;
    } catch (error) {
      throw new ListProductsError();
    }
  }
}

export { ListProductsService };

