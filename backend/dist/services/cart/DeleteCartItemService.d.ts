interface DeleteCartItemServiceProps {
    id: string;
    user_id: string;
}
declare class DeleteCartItemService {
    execute({ id, user_id }: DeleteCartItemServiceProps): Promise<{
        message: string;
    }>;
}
export { DeleteCartItemService };
//# sourceMappingURL=DeleteCartItemService.d.ts.map