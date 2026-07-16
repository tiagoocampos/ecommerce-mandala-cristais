import prismaClient from "../../prisma/index.js";

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

class CreateAddressService {
    async execute({
        user_id,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zip_code,
    }: CreateAddressProps) {

        const address = await prismaClient.address.create({
            data: {
                user_id,
                street,
                number,
                complement: complement ?? null,
                neighborhood,
                city,
                state,
                zip_code,
            }
        });

        return address;
    }
}

export { CreateAddressService };