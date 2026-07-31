import { DeleteCategoryService } from '../../services/category/DeleteCategoryService.js';
class DeleteCategoryController {
    async handle(req, res) {
        const { id } = req.params;
        const deleteCategoryService = new DeleteCategoryService();
        const result = await deleteCategoryService.execute({ id });
        return res.json(result);
    }
}
export { DeleteCategoryController };
//# sourceMappingURL=DeleteCategoryController.js.map