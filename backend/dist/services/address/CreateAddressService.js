import prismaClient from "../../prisma/index.js";
class CreateAddressService {
    async execute({ user_id, street, number, complement, neighborhood, city, state, zip_code, }) {
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
//# sourceMappingURL=CreateAddressService.js.map