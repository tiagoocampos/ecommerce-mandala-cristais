interface UpdateAddressProps {
    user_id: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    id: string;
}
declare class UpdateAddressService {
    execute({ user_id, street, number, complement, neighborhood, city, state, zip_code, id }: UpdateAddressProps): Promise<{
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
export { UpdateAddressService };
//# sourceMappingURL=UpdateAddressService.d.ts.map