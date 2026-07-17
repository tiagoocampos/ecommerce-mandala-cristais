import { DeleteProductError, ProductNotFoundError } from "../../exceptions/ProductErrors.js";
import prismaClient from "../../prisma/index.js";

interface DeleteProductServiceProps {
    product_id: string;
}

class DeleteProductService {
    async execute({ product_id }: DeleteProductServiceProps) {
        try {
            const productExists = await prismaClient.product.findFirst({
                where: {
                    id: product_id,
                },
            });

            if (!productExists) {
                throw new ProductNotFoundError();
            }
            
            await prismaClient.product.update({
                where: {
                    id: product_id,
                },
                data:{
                    disabled: true
                }
            });

            return { message: "Produto deletado/arquivado com sucesso" };
        } catch (error) {
            console.log(error);
            if(error instanceof ProductNotFoundError){
                throw error;
            }
            throw new DeleteProductError();
        }
    }
}

export { DeleteProductService };