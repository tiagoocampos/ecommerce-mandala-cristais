import { Request, Response } from "express";
import { ListProductsService } from "../../services/product/ListProductsService.js";

class ListProductsController {
  async handle(req: Request, res: Response) {
    const disabled = req.query.disabled as string;

    console.log(typeof disabled);

    const listProductsService = new ListProductsService();
    const products = await listProductsService.execute({ disabled: disabled });

    return res.json(products);
  }
}

export { ListProductsController };

