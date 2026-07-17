import {Request, Response } from 'express';
import { CreateProductService } from '../../services/product/CreateProductService.js';
import { ImageRequiredError } from '../../exceptions/ProductErrors.js';

class CreateProductController {
    async handle(req: Request, res: Response) {
        const { name, price, stock, promo_price, description, category_id} = req.body
  
        if(!req.file){
            throw new ImageRequiredError();
        }

        const createProductService = new CreateProductService();
        const product = await createProductService.execute({
            name: name,
            price: parseInt(price),
            promo_price: promo_price ? parseInt(promo_price) : undefined,
            stock: parseInt(stock),
            description: description,
            category_id: category_id,
            imageBuffer: req.file.buffer,
            imageName: req.file.originalname
        });
        return res.json(product);
    }
}

export { CreateProductController }