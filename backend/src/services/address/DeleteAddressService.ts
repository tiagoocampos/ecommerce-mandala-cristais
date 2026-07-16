import { AddressNotFoundError, AddressNotOwnedError, DeleteAddressError } from "../../exceptions/AddressErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteAddressServiceProps {
    id: string;
    user_id: string
}

class DeleteAddressService {
    async execute({ id, user_id }: DeleteAddressServiceProps) {
        try {
            const address = await prismaClient.address.findFirst({ where: { id } });
                if (!address) {
                    throw new AddressNotFoundError();
                }
                if(address.user_id !== user_id){
                    throw new AddressNotOwnedError();
                }

        await prismaClient.address.delete({ where: { id } });

        return { message: "Endereço deletado com sucesso" };
        } catch (error) {
            if(error instanceof AddressNotFoundError){
                throw error;
            }
            if(error instanceof AddressNotOwnedError){
                throw error;
            }

            
            
            throw new DeleteAddressError();
        }
    }
}

export { DeleteAddressService };