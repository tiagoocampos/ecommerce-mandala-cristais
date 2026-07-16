import { Request, Response } from "express";
import { ListCategoriesService } from "../../services/category/ListCategoriesService.js";

class ListCategoriesController {
    async handle(req: Request, res: Response) {
        const listCategories = new ListCategoriesService();
        const categories = await listCategories.execute();

        return res.json(categories);
    }
}

export { ListCategoriesController };

