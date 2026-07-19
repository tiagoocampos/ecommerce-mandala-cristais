import prismaClient from "../../prisma/index.js";

interface GetOrCreateCartServiceProps {
    user_id: string;
}

class GetOrCreateCartService {
    async execute({ user_id }: GetOrCreateCartServiceProps) {

        const cart = await prismaClient.cart.findUnique({
            where: {
                user_id,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (cart) {
            return cart;
        }

        const newCart = await prismaClient.cart.create({
            data: {
                user_id,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return newCart;
    }
}

export { GetOrCreateCartService };