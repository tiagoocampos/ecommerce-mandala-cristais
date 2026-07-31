interface DeleteAddressServiceProps {
    id: string;
    user_id: string;
}
declare class DeleteAddressService {
    execute({ id, user_id }: DeleteAddressServiceProps): Promise<{
        message: string;
    }>;
}
export { DeleteAddressService };
//# sourceMappingURL=DeleteAddressService.d.ts.map