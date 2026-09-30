import { type ShippingFields } from "../../utils/parseShippingFields.js";
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
declare class UpdateProductService {
    execute({ product_id, name, price, promo_price, stock, description, category_id, imageBuffer, imageName, weight_grams, height_cm, width_cm, length_cm, meta_description, image_alt_text, disabled, featured, }: UpdateProductServiceProps): Promise<{
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
        disabled: boolean;
    }>;
}
export { UpdateProductService };
//# sourceMappingURL=UpdateProductService.d.ts.map