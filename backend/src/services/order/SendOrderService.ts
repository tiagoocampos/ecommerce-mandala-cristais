import { CreateOrderError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";

interface SendOrderProps{
    order_id: string;
    name: string;
}

class SendOrderService{
    async execute({ order_id,  name }: SendOrderProps){
        try{
            const order = await prismaClient.order.findFirst({
                where: {
                    id: order_id
                }
            })

            if(!order){
                throw new CreateOrderError();
            }

            const updateOrder = await prismaClient.order.update({
                where: {
                    id: order_id
                },
                data: {
                    draft: false,
                    name: name
                },
                select: {
                    id: true,
                    table: true,
                    status: true,
                    draft: true,
                    name: true,
                    createdAt: true,
                }
            })

            return updateOrder
        } catch(error){
            throw new CreateOrderError();
        }
    }
}

export { SendOrderService }