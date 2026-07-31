import { AddressNotFoundError } from "../../exceptions/AddressErrors.js";
import { AddressNotOwnedError } from "../../exceptions/AddressErrors.js";
import prismaClient from "../../prisma/index.js";
export async function findAddressOrFail({ id, user_id }) {
    const address = await prismaClient.address.findFirst({ where: { id } });
    if (!address) {
        throw new AddressNotFoundError();
    }
    if (address.user_id !== user_id) {
        throw new AddressNotOwnedError();
    }
    return address;
}
//# sourceMappingURL=findAddressOrFail.js.map