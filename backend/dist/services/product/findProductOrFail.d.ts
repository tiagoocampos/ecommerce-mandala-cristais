export declare function findProductOrFail(id: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
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
//# sourceMappingURL=findProductOrFail.d.ts.map