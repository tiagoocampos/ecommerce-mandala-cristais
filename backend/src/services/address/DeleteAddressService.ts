import { AddressNotFoundError, AddressNotOwnedError, DeleteAddressError } from "../../exceptions/AddressErrors.js";
import prismaClient from "../../prisma/index.js";
import { findAddressOrFail } from "./findAddressOrFail.js";



interface DeleteAddressServiceProps {
    id: string;
    user_id: string
}

class DeleteAddressService {
    async execute({ id, user_id }: DeleteAddressServiceProps) {
        

        try {
            await findAddressOrFail({ id, user_id });

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