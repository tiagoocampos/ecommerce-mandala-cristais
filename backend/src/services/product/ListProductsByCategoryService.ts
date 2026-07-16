import prismaClient from "../../prisma/index.js";
import { ListProductsError } from "../../exceptions/ProductErrors.js";
import { CategoryNotFoundError } from "../../exceptions/CategoryErrors.js";

interface ListProductsByCategoryServiceProps {
  category_id: string;
}

class ListProductsByCategoryService {
  async execute({ category_id }: ListProductsByCategoryServiceProps) {
    try {

        const category = await prismaClient.category.findUnique({
            where: {
                id: category_id,
            }
        })

        if(!category){
            throw new CategoryNotFoundError();
        }

      const products = await prismaClient.product.findMany({
        where: {
          category_id: category_id,
          disabled: false,
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
          category: {
            select: {
              id: true,
              name: true,
            },
          }
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return products;
    } catch (error) {
      console.log(error);
      throw new ListProductsError();
    }
  }
}

export { ListProductsByCategoryService };

