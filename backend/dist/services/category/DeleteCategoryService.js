import { CategoryNotFoundError, DeleteCategoryError } from "../../exceptions/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";
class DeleteCategoryService {
    async execute({ id }) {
        try {
            const category = await prismaClient.category.findFirst({ where: { id } });
            if (!category) {
                throw new CategoryNotFoundError();
            }
            await prismaClient.category.delete({ where: { id } });
            return { message: "Categoria deletada com sucesso" };
        }
        catch (error) {
            if (error instanceof CategoryNotFoundError) {
                throw error;
            }
            throw new DeleteCategoryError();
        }
    }
}
export { DeleteCategoryService };
//# sourceMappingURL=DeleteCategoryService.js.map