import { ItemNotFoundError } from "../../exceptions/CartErrors.js";
import prismaClient from "../../prisma/index.js";
class UpdateCartItemService {
    async execute({ id, user_id, quantity }) {
        const cartItem = await prismaClient.cartItem.findFirst({
            where: {
                id,
                cart: {
                    user_id,
                },
            },
        });
        if (!cartItem) {
            throw new ItemNotFoundError();
        }
        const updatedCartItem = await prismaClient.cartItem.update({
            where: {
                id,
            },
            data: {
                quantity,
            },
        });
        return updatedCartItem;
    }
}
export { UpdateCartItemService };
//# sourceMappingURL=UpdateCartItemService.js.map