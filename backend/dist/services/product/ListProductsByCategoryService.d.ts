interface ListProductsByCategoryServiceProps {
    category_id: string;
}
declare class ListProductsByCategoryService {
    execute({ category_id }: ListProductsByCategoryServiceProps): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        category: {
            name: string;
            id: string;
        };
        price: number;
        stock: number;
        promo_price: number | null;
        description: string;
        category_id: string;
        banner: string;
        disabled: boolean;
    }[]>;
}
export { ListProductsByCategoryService };
//# sourceMappingURL=ListProductsByCategoryService.d.ts.map