import { UpdateCategoryService } from "../../services/category/UpdateCategoryService.js";
class UpdateCategoryController {
    async handle(req, res) {
        const { id } = req.params;
        const { name } = req.body;
        const updateCategoryService = new UpdateCategoryService();
        const category = await updateCategoryService.execute({ id, name });
        return res.json(category);
    }
}
export { UpdateCategoryController };
//# sourceMappingURL=UpdateCategoryController.js.map