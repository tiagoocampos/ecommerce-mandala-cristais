import { Request, Response } from "express";
import { ListProductsByCategoryService } from "../../services/product/ListProductsByCategoryService.js";

export class ListProductsByCategoryController {
  async handle(req: Request, res: Response) {
    const category_id = req.query.category_id as string;

    const listProductsByCategoryService = new ListProductsByCategoryService();
    const products = await listProductsByCategoryService.execute({ category_id: category_id });

    return res.json(products);
  }
}

