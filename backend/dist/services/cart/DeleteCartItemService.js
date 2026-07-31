import { ItemNotFoundError } from "../../exceptions/CartErrors.js";
import prismaClient from "../../prisma/index.js";
class DeleteCartItemService {
    async execute({ id, user_id }) {
        const item = await prismaClient.cartItem.findFirst({
            where: {
                id,
                cart: {
                    user_id,
                },
            },
        });
        if (!item) {
            throw new ItemNotFoundError();
        }
        await prismaClient.cartItem.delete({
            where: {
                id,
            },
        });
        return {
            message: "Item deletado com sucesso",
        };
    }
}
export { DeleteCartItemService };
//# sourceMappingURL=DeleteCartItemService.js.map