import { CreateCategoryError } from "../../exceptions/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";
import { generateSlug } from "../../utils/generateSlug.js";
class CreateCategoryService {
    async execute({ name }) {
        try {
            const slug = generateSlug(name);
            const category = await prismaClient.category.create({
                data: {
                    name: name,
                    slug: slug,
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    createdAt: true,
                }
            });
            return category;
        }
        catch (error) {
            throw new CreateCategoryError();
        }
    }
}
export { CreateCategoryService };
//# sourceMappingURL=CreateCategoryService.js.map