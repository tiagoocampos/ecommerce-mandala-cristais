interface ListProductsServiceProps {
    disabled?: string;
}
declare class ListProductsService {
    execute({ disabled }: ListProductsServiceProps): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        category: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
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
export { ListProductsService };
//# sourceMappingURL=ListProductsService.d.ts.map