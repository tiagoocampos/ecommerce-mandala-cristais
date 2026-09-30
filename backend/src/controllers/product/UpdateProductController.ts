import {Request, Response } from 'express';
import { UpdateProductService } from '../../services/product/UpdateProductService.js';
import { parseShippingFields } from '../../utils/parseShippingFields.js';
import { parseSeoFields } from '../../utils/parseSeoFields.js';


class UpdateProductController {
    async handle(req: Request, res: Response) {
        const product_id = req.query.product_id as string;
        const { name, price, promo_price, stock, description, category_id, disabled, featured } = req.body;
        const updateProductService = new UpdateProductService();
        
        const imageBuffer = req.file ? req.file.buffer : undefined;
        const imageName = req.file ? req.file.originalname : undefined;


        const product = await updateProductService.execute({ 
            product_id: product_id, 
            name: name,
            // atualização parcial: sem `price` no body, não mexe no preço (antes virava NaN)
            price: price ? parseInt(price) : undefined,
            promo_price: promo_price ? parseInt(promo_price) : undefined,
            stock: stock ? parseInt(stock) : undefined,
            description, 
            category_id, 
            imageBuffer: imageBuffer,
            imageName: imageName,
            ...parseShippingFields(req.body),
            ...parseSeoFields(req.body),
            disabled: disabled === undefined ? undefined : disabled === "true",
            featured: featured === undefined ? undefined : featured === "true",
         });
        return res.status(200).json(product);
       
        
    }
}
export { UpdateProductController };