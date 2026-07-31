import { ListProductsService } from "../../services/product/ListProductsService.js";
class ListProductsController {
    async handle(req, res) {
        const disabled = req.query.disabled;
        const listProductsService = new ListProductsService();
        const products = await listProductsService.execute({ disabled: disabled });
        return res.json(products);
    }
}
export { ListProductsController };
//# sourceMappingURL=ListProductsController.js.map