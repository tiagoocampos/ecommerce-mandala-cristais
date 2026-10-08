import { CreateProductService } from '../../services/product/CreateProductService.js';
import { ImageRequiredError } from '../../exceptions/ProductErrors.js';
import { definedShippingFields, parseShippingFields } from '../../utils/parseShippingFields.js';
import { parseSeoFields } from '../../utils/parseSeoFields.js';
class CreateProductController {
    async handle(req, res) {
        const { name, price, stock, promo_price, description, category_id } = req.body;
        // upload.fields: `file` = principal (obrigatória), `images` = extras (opcionais)
        const files = (req.files ?? {});
        const mainFile = files.file?.[0];
        if (!mainFile) {
            throw new ImageRequiredError(); // garante "no mínimo uma imagem"
        }
        const extraImages = (files.images ?? []).map((f) => ({ buffer: f.buffer, name: f.originalname }));
        const createProductService = new CreateProductService();
        const product = await createProductService.execute({
            name: name,
            price: parseInt(price),
            promo_price: promo_price ? parseInt(promo_price) : undefined,
            stock: parseInt(stock),
            description: description,
            category_id: category_id,
            imageBuffer: mainFile.buffer,
            imageName: mainFile.originalname,
            extraImages,
            ...definedShippingFields(parseShippingFields(req.body)),
            ...parseSeoFields(req.body),
            featured: req.body.featured === "true",
        });
        return res.json(product);
    }
}
export { CreateProductController };
//# sourceMappingURL=CreateProductController.js.map