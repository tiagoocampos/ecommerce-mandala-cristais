import { ItemNotFoundError } from "../../exceptions/CartErrors.js";
import prismaClient from "../../prisma/index.js";

interface UpdateCartItemServiceProps {
    id: string;
    user_id: string;
    quantity: number;
}

class UpdateCartItemService {
    async execute({ id, user_id, quantity }: UpdateCartItemServiceProps) {

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