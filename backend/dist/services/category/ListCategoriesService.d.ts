declare class ListCategoriesService {
    execute(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        products: {
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
        }[];
    }[]>;
}
export { ListCategoriesService };
//# sourceMappingURL=ListCategoriesService.d.ts.map