import { CreateOrderError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteOrderProps{
    order_id: string;
}

class DeleteOrderService{
    async execute({ order_id }: DeleteOrderProps){
        try{
            const order = await prismaClient.order.findFirst({
                where: {
                    id: order_id
                }
            })

            if(!order){
                throw new Error("Falha ao deletar o pedido")
            }

            await prismaClient.order.delete({
                where: {
                    id: order_id
                }
            })

            return { message: "Pedido deletado com sucesso" }
        } catch(error){
            throw new Error("Falha ao finalizar pedido")
        }
    }
}

export { DeleteOrderService }