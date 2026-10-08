import { ProductImageNotFoundError, ProductNotFoundError, TooManyProductImagesError } from "../../exceptions/ProductErrors.js";
import prismaClient from "../../prisma/index.js";
import { deleteImageByUrl, MAX_EXTRA_IMAGES, uploadImage } from "../../utils/uploadImage.js";

const imageSelect = { id: true, url: true, position: true } as const;

async function listImages(product_id: string) {
    return prismaClient.productImage.findMany({
        where: { product_id },
        orderBy: { position: "asc" },
        select: imageSelect,
    });
}

// Gerencia as fotos ADICIONAIS de um produto. A principal fica em Product.banner e
// nunca pode ser apagada: para trocá-la, use setMain ou PUT /product com novo `file`.
class ProductImagesService {
    /** Acrescenta fotos ao final da galeria. */
    async add({ product_id, files }: { product_id: string; files: { buffer: Buffer; name: string }[] }) {
        const product = await prismaClient.product.findUnique({ where: { id: product_id }, select: { id: true } });
        if (!product) throw new ProductNotFoundError();

        const existing = await listImages(product_id);
        if (existing.length + files.length > MAX_EXTRA_IMAGES) {
            throw new TooManyProductImagesError(MAX_EXTRA_IMAGES);
        }

        const uploaded: string[] = [];
        try {
            const urls = await Promise.all(
                files.map(async (file) => {
                    const url = await uploadImage(file.buffer, file.name);
                    uploaded.push(url);
                    return url;
                })
            );
            const nextPosition = existing.length ? Math.max(...existing.map((i) => i.position)) + 1 : 0;
            await prismaClient.productImage.createMany({
                data: urls.map((url, i) => ({ product_id, url, position: nextPosition + i })),
            });
        } catch (error) {
            await Promise.all(uploaded.map((url) => deleteImageByUrl(url)));
            throw error;
        }

        return listImages(product_id);
    }

    /** Remove uma foto adicional (banco + Cloudinary). */
    async remove({ image_id }: { image_id: string }) {
        const image = await prismaClient.productImage.findUnique({ where: { id: image_id } });
        if (!image) throw new ProductImageNotFoundError();

        await prismaClient.productImage.delete({ where: { id: image_id } });
        await deleteImageByUrl(image.url); // best-effort

        return listImages(image.product_id);
    }

    /** Torna uma foto adicional a principal: troca as URLs entre Product.banner e a foto. */
    async setMain({ image_id }: { image_id: string }) {
        const result = await prismaClient.$transaction(async (tx) => {
            const image = await tx.productImage.findUnique({
                where: { id: image_id },
                include: { product: { select: { id: true, banner: true } } },
            });
            if (!image) throw new ProductImageNotFoundError();

            // a antiga principal passa a ocupar o lugar da foto promovida na galeria
            await tx.productImage.update({ where: { id: image_id }, data: { url: image.product.banner } });
            return tx.product.update({
                where: { id: image.product.id },
                data: { banner: image.url },
                select: { id: true, banner: true },
            });
        });

        return { ...result, images: await listImages(result.id) };
    }
}

export { ProductImagesService };
