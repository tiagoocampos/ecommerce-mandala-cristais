import { Request, Response } from "express";
import { ProductImagesService } from "../../services/product/ProductImagesService.js";

class ProductImagesController {
    /** POST /product/:product_id/images (multipart, campo `images`) */
    async add(req: Request, res: Response) {
        const { product_id } = req.params as { product_id: string };
        const files = (req.files as Express.Multer.File[] | undefined) ?? [];
        if (files.length === 0) {
            return res.status(400).json({ error: "Envie ao menos uma imagem no campo images." });
        }
        const images = await new ProductImagesService().add({
            product_id,
            files: files.map((f) => ({ buffer: f.buffer, name: f.originalname })),
        });
        return res.status(201).json(images);
    }

    /** DELETE /product/images/:image_id */
    async remove(req: Request, res: Response) {
        const { image_id } = req.params as { image_id: string };
        return res.json(await new ProductImagesService().remove({ image_id }));
    }

    /** PATCH /product/images/:image_id/main */
    async setMain(req: Request, res: Response) {
        const { image_id } = req.params as { image_id: string };
        return res.json(await new ProductImagesService().setMain({ image_id }));
    }
}

export { ProductImagesController };
