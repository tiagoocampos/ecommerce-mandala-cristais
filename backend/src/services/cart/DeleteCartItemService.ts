import { ItemNotFoundError } from "../../exceptions/CartErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteCartItemServiceProps {
    id: string;
    user_id: string;
}

class DeleteCartItemService {
    async execute({ id, user_id }: DeleteCartItemServiceProps) {

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