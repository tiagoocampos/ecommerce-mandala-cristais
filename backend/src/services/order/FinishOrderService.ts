import { CreateOrderError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";

interface FinishOrderProps{
    order_id: string;
}

class FinishOrderService{
    async execute({ order_id }: FinishOrderProps){
        try{
            const order = await prismaClient.order.findFirst({
                where: {
                    id: order_id
                }
            })

            if(!order){
                throw new Error("Falha ao finalizar pedido")
            }

            const updateOrder = await prismaClient.order.update({
                where: {
                    id: order_id
                },
                data: {
                    status: true,
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
            throw new Error("Falha ao finalizar pedido")
        }
    }
}

export { FinishOrderService }