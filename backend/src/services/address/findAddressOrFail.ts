import { AddressNotFoundError } from "../../exceptions/AddressErrors.js";
import { AddressNotOwnedError } from "../../exceptions/AddressErrors.js";
import prismaClient from "../../prisma/index.js";

interface findAddressOrFailProps {
    id: string;
    user_id: string;
}

export async function findAddressOrFail({ id, user_id }: findAddressOrFailProps) {


    const address = await prismaClient.address.findFirst({ where: { id } });
    if (!address) {
        throw new AddressNotFoundError();
    }
    if (address.user_id !== user_id) {
        throw new AddressNotOwnedError();
    }
    return address;
}