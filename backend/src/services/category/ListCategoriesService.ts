import prismaClient from "../../prisma/index.js";
import { ListCategoriesError } from "../../exceptions/CategoryErrors.js";

class ListCategoriesService {
    async execute() {
        try {
            const categories = await prismaClient.category.findMany({
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    slug: true
                },
                orderBy: {
                    createdAt: "desc",
                },
            });

            return categories;
        } catch (error) {
            throw new ListCategoriesError();
        }
    }
}

export { ListCategoriesService };


