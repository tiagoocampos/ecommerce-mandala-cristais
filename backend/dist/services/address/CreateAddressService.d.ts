interface CreateAddressProps {
    user_id: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
}
declare class CreateAddressService {
    execute({ user_id, street, number, complement, neighborhood, city, state, zip_code, }: CreateAddressProps): Promise<{
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
    }>;
}
export { CreateAddressService };
//# sourceMappingURL=CreateAddressService.d.ts.map