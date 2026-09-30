import prismaClient from "../../prisma/index.js";
import { ListProductsError } from "../../exceptions/ProductErrors.js";
class ListProductsService {
    async execute({ disabled }) {
        try {
            const products = await prismaClient.product.findMany({
                where: {
                    disabled: disabled === "true" ? true : false,
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    description: true,
                    banner: true,
                    disabled: true,
                    category_id: true,
                    slug: true,
                    promo_price: true,
                    createdAt: true,
                    stock: true,
                    category: true,
                    weight_grams: true,
                    height_cm: true,
                    width_cm: true,
                    length_cm: true,
                    meta_description: true,
                    image_alt_text: true,
                    featured: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return products;
        }
        catch (error) {
            throw new ListProductsError();
        }
    }
}
export { ListProductsService };
//# sourceMappingURL=ListProductsService.js.map