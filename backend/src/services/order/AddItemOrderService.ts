import { AddItemError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";

interface ItemProps {
    order_id: string;
    product_id: string;
    amount: number;
}

class AddItemOrderService {
    async execute({ order_id, product_id, amount }: ItemProps) {
        try{

            const orderExist = prismaClient.order.findFirst({
                where: {
                    id: order_id,
                },
            })

            if(!orderExist){
                throw new AddItemError();
            }

            const productExists = await prismaClient.product.findFirst({
                where: {
                    id: product_id,
                    disabled: false
                },
            })

            if(!productExists){
                throw new AddItemError();
            }

            const item = await prismaClient.item.create({
            data: {
                order_id: order_id,
                product_id: product_id,
                amount: amount,
            },
            select: {
                id: true,
                order_id: true,
                product_id: true,
                amount: true,
                createdAt: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        description: true,
                        banner: true,
                    }
                }
            }
        });
        return item;
        } catch(error){
            throw new AddItemError();
        }
    }
}

export { AddItemOrderService };