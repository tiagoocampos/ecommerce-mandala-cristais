import {Request, Response } from 'express';
import { UpdateProductService } from '../../services/product/UpdateProductService.js';


class UpdateProductController {
    async handle(req: Request, res: Response) {
        const product_id = req.query.product_id as string;
        const { name, price, promo_price, stock, description, category_id } = req.body;
        const updateProductService = new UpdateProductService();
        
        const imageBuffer = req.file ? req.file.buffer : undefined;
        const imageName = req.file ? req.file.originalname : undefined;


        const product = await updateProductService.execute({ 
            product_id: product_id, 
            name: name,
            price: parseInt(price),
            promo_price: promo_price ? parseInt(promo_price) : undefined,
            stock: stock ? parseInt(stock) : undefined,
            description, 
            category_id, 
            imageBuffer: imageBuffer,
            imageName: imageName
         });
        return res.status(200).json(product);
       
        
    }
}
export { UpdateProductController };