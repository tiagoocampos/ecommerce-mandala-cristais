interface CreateProductServiceProps {
    name: string;
    price: number;
    promo_price?: number | null | undefined;
    stock: number;
    description: string;
    category_id: string;
    imageBuffer: Buffer;
    imageName: string;
}
declare class CreateProductService {
    execute({ name, price, stock, promo_price, description, category_id, imageBuffer, imageName }: CreateProductServiceProps): Promise<{
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
    }>;
}
export { CreateProductService };
//# sourceMappingURL=CreateProductService.d.ts.map