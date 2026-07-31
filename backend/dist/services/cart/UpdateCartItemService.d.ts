interface UpdateCartItemServiceProps {
    id: string;
    user_id: string;
    quantity: number;
}
declare class UpdateCartItemService {
    execute({ id, user_id, quantity }: UpdateCartItemServiceProps): Promise<{
        id: string;
        product_id: string;
        quantity: number;
        cart_id: string;
    }>;
}
export { UpdateCartItemService };
//# sourceMappingURL=UpdateCartItemService.d.ts.map