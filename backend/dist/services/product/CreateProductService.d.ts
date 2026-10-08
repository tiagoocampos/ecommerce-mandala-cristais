import type { ShippingFields } from "../../utils/parseShippingFields.js";
interface CreateProductServiceProps extends ShippingFields {
    meta_description?: string | null | undefined;
    image_alt_text?: string | null | undefined;
    featured?: boolean | undefined;
    name: string;
    price: number;
    promo_price?: number | null | undefined;
    stock: number;
    description: string;
    category_id: string;
    imageBuffer: Buffer;
    imageName: string;
    /** fotos adicionais (opcionais), na ordem de exibição */
    extraImages?: {
        buffer: Buffer;
        name: string;
    }[];
}
declare class CreateProductService {
    execute({ name, price, stock, promo_price, description, category_id, imageBuffer, imageName, weight_grams, height_cm, width_cm, length_cm, meta_description, image_alt_text, featured, extraImages, }: CreateProductServiceProps): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        weight_grams: number | null;
        height_cm: number | null;
        width_cm: number | null;
        length_cm: number | null;
        meta_description: string | null;
        image_alt_text: string | null;
        featured: boolean;
        price: number;
        promo_price: number | null;
        stock: number;
        description: string;
        category_id: string;
        banner: string;
        images: {
            url: string;
            id: string;
            position: number;
        }[];
    }>;
    private create;
}
export { CreateProductService };
//# sourceMappingURL=CreateProductService.d.ts.map