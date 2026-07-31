import { Preference } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import prismaClient from "../../prisma/index.js";
import { OrderNotFoundError } from "../../exceptions/OrdersErrors.js";
import { PaymentCreationError } from "../../exceptions/PaymentErrors.js";
class CreatePreferenceService {
    async execute({ order_id, user_id }) {
        const frontendUrl = process.env.FRONTEND_URL;
        const backendUrl = process.env.BACKEND_URL;
        const order = await prismaClient.order.findFirst({
            where: {
                id: order_id,
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
        if (!order) {
            throw new OrderNotFoundError();
        }
        const items = order.items.map((item) => ({
            id: item.product.id,
            title: item.product.name,
            unit_price: item.unit_price / 100,
            quantity: item.quantity,
            currency_id: "BRL",
        }));
        const preferenceData = {
            items,
            // IMPORTANTE:
            // Esse ID será usado pelo webhook para encontrar o pedido
            external_reference: order.id,
            back_urls: {
                success: `${frontendUrl}/payment/success`,
                failure: `${frontendUrl}/payment/failure`,
                pending: `${frontendUrl}/payment/pending`,
            },
            notification_url: `${backendUrl}/payment/webhook`,
            auto_return: "approved",
        };
        console.log("PEDIDO ENVIADO AO MERCADO PAGO:", order.id);
        try {
            const preference = new Preference(client);
            const response = await preference.create({
                body: preferenceData,
            });
            console.log("========== PREFERENCE DATA ==========");
            console.log(JSON.stringify(preferenceData, null, 2));
            console.log("=====================================");
            if (!response.id) {
                throw new PaymentCreationError();
            }
            // Garante que existe um registro de pagamento
            const paymentExists = await prismaClient.payment.findUnique({
                where: {
                    order_id: order.id,
                },
            });
            if (!paymentExists) {
                await prismaClient.payment.create({
                    data: {
                        order_id: order.id,
                        provider: "mercado_pago",
                        status: "PENDING",
                    },
                });
            }
            console.log("PREFERÊNCIA CRIADA:", response.id);
            console.log("EXTERNAL REFERENCE:", preferenceData.external_reference);
            console.log("PEDIDO ENVIADO AO MERCADO PAGO:", order.id);
            console.log("INIT POINT:", response.init_point);
            return {
                order_id: order.id,
                checkout_url: response.init_point,
            };
        }
        catch (error) {
            console.error("ERRO AO CRIAR PREFERÊNCIA:", error);
            throw new PaymentCreationError();
        }
    }
}
export { CreatePreferenceService };
//# sourceMappingURL=CreatePreferenceService.js.map