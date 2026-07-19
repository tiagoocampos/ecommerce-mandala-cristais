import { AddressNotFoundError, AddressNotOwnedError, UpdateAddressError } from "../../exceptions/AddressErrors.js";
import prismaClient from "../../prisma/index.js";
import { findAddressOrFail } from "./findAddressOrFail.js";

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

class UpdateAddressService {
    async execute({ user_id, street, number, complement, neighborhood, city, state, zip_code, id }: UpdateAddressProps) {
        try {
            await findAddressOrFail({ id, user_id });

            const address = await prismaClient.address.update({
                where: {
                    id
                },
                data: {
                    ...(street !== undefined && { street }),
                    ...(number !== undefined && { number }),
                    ...(complement !== undefined && { complement }),
                    ...(neighborhood !== undefined && { neighborhood }),
                    ...(city !== undefined && { city }),
                    ...(state !== undefined && { state }),
                    ...(zip_code !== undefined && { zip_code }),
                }
            });

            return address;
        } catch (error) {
            if (error instanceof AddressNotFoundError) {
                throw error;
            }

            if (error instanceof AddressNotOwnedError) {
                throw error;
            }

            throw new UpdateAddressError();
        }
    }
}

export { UpdateAddressService };