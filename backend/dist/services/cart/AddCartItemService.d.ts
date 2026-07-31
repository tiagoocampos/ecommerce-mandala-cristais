interface AddCartItemServiceProps {
    user_id: string;
    product_id: string;
    quantity: number;
}
declare class AddCartItemService {
    execute({ user_id, product_id, quantity }: AddCartItemServiceProps): Promise<{
        id: string;
        product_id: string;
        quantity: number;
        cart_id: string;
    }>;
}
export { AddCartItemService };
//# sourceMappingURL=AddCartItemService.d.ts.map