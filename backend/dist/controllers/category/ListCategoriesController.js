import { ListCategoriesService } from "../../services/category/ListCategoriesService.js";
class ListCategoriesController {
    async handle(req, res) {
        const listCategories = new ListCategoriesService();
        const categories = await listCategories.execute();
        return res.json(categories);
    }
}
export { ListCategoriesController };
//# sourceMappingURL=ListCategoriesController.js.map