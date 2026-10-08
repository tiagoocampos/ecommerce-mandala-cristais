import prismaClient from "../../prisma/index.js";
import { UpdateProductError, ProductNotFoundError, ProductAlreadyExistsError } from "../../exceptions/ProductErrors.js";
import { CategoryNotFoundError } from "../../exceptions/CategoryErrors.js";
import { uploadImage } from "../../utils/uploadImage.js";
import { generateSlug } from "../../utils/generateSlug.js";
import { findProductOrFail } from "./findProductOrFail.js";
import { definedShippingFields, type ShippingFields } from "../../utils/parseShippingFields.js";

interface UpdateProductServiceProps extends ShippingFields {
    meta_description?: string | null | undefined;
    image_alt_text?: string | null | undefined;
    disabled?: boolean | undefined;
    featured?: boolean | undefined;
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
        weight_grams,
        height_cm,
        width_cm,
        length_cm,
        meta_description,
        image_alt_text,
        disabled,
        featured,
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
                    bannerUrl = await uploadImage(imageBuffer, imageName);
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
                    ...definedShippingFields({ weight_grams, height_cm, width_cm, length_cm }),
                    ...(meta_description !== undefined && { meta_description }),
                    ...(image_alt_text !== undefined && { image_alt_text }),
                    ...(disabled !== undefined && { disabled }),
                    ...(featured !== undefined && { featured }),
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