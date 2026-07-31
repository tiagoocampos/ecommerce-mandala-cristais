interface ListAddressProps {
    user_id: string;
}
declare class ListAddressService {
    execute({ user_id }: ListAddressProps): Promise<{
        number: string;
        id: string;
        createdAt: Date;
        user_id: string;
        street: string;
        complement: string | null;
        neighborhood: string;
        city: string;
        state: string;
        zip_code: string;
    }[]>;
}
export { ListAddressService };
//# sourceMappingURL=ListAddressService.d.ts.map