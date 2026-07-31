import prismaClient from "../../prisma/index.js";
class GetOrCreateCartService {
    async execute({ user_id }) {
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
//# sourceMappingURL=GetOrCreateCartService.js.map