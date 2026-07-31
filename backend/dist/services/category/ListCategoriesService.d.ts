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
            price: number;
            stock: number;
            promo_price: number | null;
            description: string;
            category_id: string;
            banner: string;
            disabled: boolean;
        }[];
    }[]>;
}
export { ListCategoriesService };
//# sourceMappingURL=ListCategoriesService.d.ts.map