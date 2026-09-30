interface GetOrCreateCartServiceProps {
    user_id: string;
}
declare class GetOrCreateCartService {
    execute({ user_id }: GetOrCreateCartServiceProps): Promise<{
        items: ({
            product: {
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
            };
        } & {
            id: string;
            product_id: string;
            quantity: number;
            cart_id: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        user_id: string;
    }>;
}
export { GetOrCreateCartService };
//# sourceMappingURL=GetOrCreateCartService.d.ts.map