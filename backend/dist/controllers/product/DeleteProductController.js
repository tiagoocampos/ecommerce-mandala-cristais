import { DeleteProductService } from '../../services/product/DeleteProductService.js';
class DeleteProductController {
    async handle(req, res) {
        const product_id = req.query?.product_id;
        const deleteProduct = new DeleteProductService();
        const product = await deleteProduct.execute({ product_id: product_id });
        res.status(200).json(product);
    }
}
export { DeleteProductController };
//# sourceMappingURL=DeleteProductController.js.map