import { CategoryNotFoundError } from "../../exceptions/CategoryErrors.js";
import prismaClient from "../../prisma/index.js";
import { generateSlug } from "../../utils/generateSlug.js";
import { deleteImageByUrl, uploadImage } from "../../utils/uploadImage.js";
class CreateProductService {
    async execute({ name, price, stock, promo_price, description, category_id, imageBuffer, imageName, weight_grams, height_cm, width_cm, length_cm, meta_description, image_alt_text, featured, extraImages = [], }) {
        const slug = generateSlug(name);
        const categoryExiste = await prismaClient.category.findFirst({
            where: {
                id: category_id
            }
        });
        if (!categoryExiste) {
            throw new CategoryNotFoundError();
        }
        // Sobe principal + extras (extras em paralelo). Se algo falhar — upload ou criação
        // do produto — apaga do Cloudinary o que já subiu (best-effort) e propaga o erro.
        const uploaded = [];
        const track = async (buffer, name) => {
            const url = await uploadImage(buffer, name);
            uploaded.push(url);
            return url;
        };
        try {
            const [bannerUrl, ...extraUrls] = await Promise.all([
                track(imageBuffer, imageName),
                ...extraImages.map((image) => track(image.buffer, image.name)),
            ]);
            return await this.create({
                bannerUrl: bannerUrl,
                extraUrls,
                data: { name, price, stock, slug, promo_price, description, category_id, weight_grams, height_cm, width_cm, length_cm, meta_description, image_alt_text, featured },
            });
        }
        catch (error) {
            console.log(error);
            await Promise.all(uploaded.map((url) => deleteImageByUrl(url)));
            if (error instanceof Error && error.name.startsWith("PrismaClient"))
                throw error;
            throw new Error("Erro ao fazer upload da imagem");
        }
    }
    async create({ bannerUrl, extraUrls, data: { name, price, stock, slug, promo_price, description, category_id, weight_grams, height_cm, width_cm, length_cm, meta_description, image_alt_text, featured }, }) {
        const product = await prismaClient.product.create({
            data: {
                name: name,
                price: price,
                stock: stock,
                slug: slug,
                promo_price: promo_price ?? null,
                description: description,
                banner: bannerUrl,
                category_id: category_id,
                weight_grams: weight_grams ?? null,
                height_cm: height_cm ?? null,
                width_cm: width_cm ?? null,
                length_cm: length_cm ?? null,
                meta_description: meta_description ?? null,
                image_alt_text: image_alt_text ?? null,
                featured: featured ?? false,
                // fotos adicionais, na ordem em que foram enviadas
                images: {
                    create: extraUrls.map((url, position) => ({ url, position })),
                },
            },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                category_id: true,
                banner: true,
                createdAt: true,
                stock: true,
                slug: true,
                promo_price: true,
                weight_grams: true,
                height_cm: true,
                width_cm: true,
                length_cm: true,
                meta_description: true,
                image_alt_text: true,
                featured: true,
                images: {
                    orderBy: { position: "asc" },
                    select: { id: true, url: true, position: true },
                },
            }
        });
        return product;
    }
}
export { CreateProductService };
//# sourceMappingURL=CreateProductService.js.map