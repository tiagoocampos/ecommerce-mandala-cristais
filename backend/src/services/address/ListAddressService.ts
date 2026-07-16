import { AddressNotFoundError } from "../../exceptions/AddressErrors.js";
import prismaClient from "../../prisma/index.js";

interface ListAddressProps{
    user_id: string
}

class ListAddressService {
    async execute({user_id}: ListAddressProps) {

        try {
            const addresses = await prismaClient.address.findMany({
            where: {
                user_id: user_id
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return addresses;
        } catch (error) {
            throw new AddressNotFoundError();
        }
    }
}

export { ListAddressService };