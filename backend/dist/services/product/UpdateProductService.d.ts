interface UpdateProductServiceProps {
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
    execute({ product_id, name, price, promo_price, stock, description, category_id, imageBuffer, imageName, }: UpdateProductServiceProps): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        slug: string;
        price: number;
        stock: number;
        promo_price: number | null;
        description: string;
        category_id: string;
        banner: string;
        disabled: boolean;
    }>;
}
export { UpdateProductService };
//# sourceMappingURL=UpdateProductService.d.ts.map