import { Request, Response } from "express";
import { ProductAIAssistService } from "../../services/product/ProductAIAssistService.js";

class ProductAIAssistController {
    async handle(req: Request, res: Response) {
        const { name, category_hint, keywords } = req.body;

        const productAIAssistService = new ProductAIAssistService();
        const result = await productAIAssistService.execute({
            name: String(name).trim(),
            category_hint: category_hint ? String(category_hint).trim() : undefined,
            keywords: keywords ? String(keywords).trim() : undefined,
        });

        return res.json(result);
    }
}

export { ProductAIAssistController };
