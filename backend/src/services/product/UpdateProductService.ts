import { Readable } from "stream";
import prismaClient from "../../prisma/index.js";
import { UpdateProductError, ProductNotFoundError, ProductAlreadyExistsError } from "../../exceptions/ProductErrors.js";
import { CategoryNotFoundError } from "../../exceptions/CategoryErrors.js";
import cloudinary from "../../config/cloudinary.js";
import { generateSlug } from "../../utils/generateSlug.js";
import { findProductOrFail } from "./findProductOrFail.js";

interface UpdateProductServiceProps {
    product_id: string;
    name?: string | undefined;
    price?: number | undefined;
    promo_price?: number | null | undefined;
    stock?: number | undefined;
    description?: string | undefined;
    category_id?: string | undefined;
    imageBuffer?: Buffer | undefined;
    imageName?: string | undefined;
}

class UpdateProductService {
    async execute({
        product_id,
        name,
        price,
        promo_price,
        stock,
        description,
        category_id,
        imageBuffer,
        imageName,
    }: UpdateProductServiceProps) {
        try {
            const product = await findProductOrFail(product_id);


            if (category_id) {
                const categoryExists = await prismaClient.category.findFirst({
                    where: { id: category_id },
                });
                if (!categoryExists) {
                    throw new CategoryNotFoundError();
                }
            }

            const finalPrice = price ?? product.price;
            const finalPromoPrice =
                promo_price !== undefined ? promo_price : product.promo_price;

            if (
                finalPromoPrice !== null &&
                finalPromoPrice !== undefined &&
                finalPromoPrice >= finalPrice
            ) {
                throw new UpdateProductError();
            }

            let bannerUrl = product.banner;
            if (imageBuffer && imageName) {
                try {
                    const result = await new Promise<any>((resolve, reject) => {
                        const uploadStream = cloudinary.uploader.upload_stream(
                            {
                                folder: "products",
                                resource_type: "image",
                                public_id: `${Date.now()}-${imageName.split(".")[0]}`,
                            },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );

                        const bufferStream = Readable.from(imageBuffer);
                        bufferStream.pipe(uploadStream);
                    });

                    bannerUrl = result.secure_url;
                } catch (error) {
                    throw new UpdateProductError();
                }
            }

            const slug = name ? generateSlug(name) : undefined;
            if (slug) {
                const productAlreadyExists = await prismaClient.product.findFirst({
                    where: {
                        slug,
                        NOT: {
                            id: product_id
                        }
                    }
            });

            if (productAlreadyExists) {
                throw new ProductAlreadyExistsError();
            }
}

            const updated = await prismaClient.product.update({
                where: { id: product_id },
                data: {
                    ...(name !== undefined && { name }),
                    ...(slug !== undefined && { slug }),
                    ...(price !== undefined && { price }),
                    ...(promo_price !== undefined && { promo_price }),
                    ...(stock !== undefined && { stock }),
                    ...(description !== undefined && { description }),
                    ...(category_id !== undefined && { category_id }),
                    banner: bannerUrl,
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    promo_price: true,
                    stock: true,
                    description: true,
                    banner: true,
                    disabled: true,
                    category_id: true,
                    createdAt: true,
                },
            });

            return updated;
        } catch (error) {
            console.log(error);
            if (error instanceof CategoryNotFoundError) {
                throw error;
            }
            if (error instanceof UpdateProductError) {
                throw error;
            }

            if (error instanceof ProductNotFoundError) {
                throw error;
            }
            if(error instanceof ProductAlreadyExistsError){
                throw error;
            }
            throw new UpdateProductError();
        }
    }
}

export { UpdateProductService };