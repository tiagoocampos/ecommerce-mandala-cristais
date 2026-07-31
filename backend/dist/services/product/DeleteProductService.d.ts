interface DeleteProductServiceProps {
    product_id: string;
}
declare class DeleteProductService {
    execute({ product_id }: DeleteProductServiceProps): Promise<{
        message: string;
    }>;
}
export { DeleteProductService };
//# sourceMappingURL=DeleteProductService.d.ts.map