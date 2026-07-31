import { CreateCategoryService } from '../../services/category/CreateCategoryService.js';
class CreateCategoryController {
    async handle(req, res) {
        const { name } = req.body;
        const createCategory = new CreateCategoryService();
        const category = await createCategory.execute({ name });
        return res.status(201).json(category);
    }
}
export { CreateCategoryController };
//# sourceMappingURL=CreateCategoryController.js.map