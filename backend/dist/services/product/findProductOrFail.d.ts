export declare function findProductOrFail(id: string): Promise<{
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
}>;
//# sourceMappingURL=findProductOrFail.d.ts.map