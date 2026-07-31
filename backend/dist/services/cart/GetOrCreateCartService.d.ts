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
                price: number;
                stock: number;
                promo_price: number | null;
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