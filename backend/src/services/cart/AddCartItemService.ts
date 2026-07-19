import { ProductNotFoundError } from "../../exceptions/ProductErrors.js";
import prismaClient from "../../prisma/index.js";
import { GetOrCreateCartService } from "./GetOrCreateCartService.js";

interface AddCartItemServiceProps {
    user_id: string;
    product_id: string;
    quantity: number;
}

class AddCartItemService {
    async execute({ user_id, product_id, quantity }: AddCartItemServiceProps) {

        const getOrCreateCartService = new GetOrCreateCartService();

        const cart = await getOrCreateCartService.execute({
            user_id,
        });

        const productExists = await prismaClient.product.findUnique({
            where: {
                id: product_id,
            },
        });

        if (!productExists) {
            throw new ProductNotFoundError();
        }

        const cartItem = await prismaClient.cartItem.findUnique({
            where: {
                cart_id_product_id: {
                    cart_id: cart.id,
                    product_id,
                },
            },
        });

        if (cartItem) {
            const updatedCartItem = await prismaClient.cartItem.update({
                where: {
                    id: cartItem.id,
                },
                data: {
                    quantity: cartItem.quantity + quantity,
                },
            });

            return updatedCartItem;
        }

        const newCartItem = await prismaClient.cartItem.create({
            data: {
                cart_id: cart.id,
                product_id,
                quantity,
            },
        });

        return newCartItem;
    }
}

export { AddCartItemService };