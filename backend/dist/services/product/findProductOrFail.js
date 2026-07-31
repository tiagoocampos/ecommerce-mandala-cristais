import prismaClient from "../../prisma/index.js";
import { ProductNotFoundError } from "../../exceptions/ProductErrors.js";
export async function findProductOrFail(id) {
    const product = await prismaClient.product.findUnique({
        where: {
            id
        }
    });
    if (!product) {
        throw new ProductNotFoundError();
    }
    return product;
}
//# sourceMappingURL=findProductOrFail.js.map