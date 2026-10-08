import { Preference } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import prismaClient from "../../prisma/index.js";
import { OrderNotFoundError, OrderNotPayableError } from "../../exceptions/OrdersErrors.js";
import { toMercadoPagoDate } from "../../utils/orderExpiration.js";
import { PaymentCreationError } from "../../exceptions/PaymentErrors.js";

interface CreatePreferenceServiceProps {
    order_id: string;
    user_id: string;
}

class CreatePreferenceService {
    async execute({ order_id, user_id }: CreatePreferenceServiceProps) {

        const frontendUrl = process.env.FRONTEND_URL as string;
        const backendUrl = process.env.BACKEND_URL as string;

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

        // Só dá para pagar pedido PENDING dentro do prazo da reserva (pode gerar nova
        // preference para o mesmo pedido: é o "Pagar agora" de "Meus pedidos").
        if (order.status !== "PENDING") {
            throw new OrderNotPayableError();
        }
        if (order.expires_at && order.expires_at.getTime() <= Date.now()) {
            throw new OrderNotPayableError("O prazo para pagar este pedido expirou. Faça um novo pedido.");
        }


        // Com cupom, o Mercado Pago precisa cobrar o total já descontado. Como ele não aceita
        // item com valor negativo, o pedido vai como um item único com o valor final (frete incluso).
        // Sem cupom, vão os produtos + uma linha de frete, somando exatamente order.total.
        const items = order.discount > 0
            ? [{
                id: order.id,
                title: `Pedido Mandala Crystais #${order.id.slice(0, 8).toUpperCase()}`,
                unit_price: order.total / 100,
                quantity: 1,
                currency_id: "BRL",
            }]
            : [
                ...order.items.map((item) => ({
                    id: item.product.id,
                    title: item.product.name,
                    unit_price: item.unit_price / 100,
                    quantity: item.quantity,
                    currency_id: "BRL",
                })),
                ...(order.shipping_cost > 0
                    ? [{
                        id: "frete",
                        title: `Frete${order.shipping_service ? ` (${order.shipping_service})` : ""}`,
                        unit_price: order.shipping_cost / 100,
                        quantity: 1,
                        currency_id: "BRL",
                    }]
                    : []),
            ];


        const preferenceData = {
            items,

            
            external_reference: order.id,

            // Link de pagamento para de valer junto com a reserva do estoque.
            // Formato ISO 8601 com fuso, conforme a doc do Mercado Pago
            // (Checkout Pro → prazo da preference: expires / expiration_date_from / expiration_date_to).
            // Não usamos date_of_expiration (prazo de Pix/boleto): a doc recomenda dias para
            // meios offline; um boleto pago depois do prazo vira "aprovação tardia" no webhook.
            ...(order.expires_at && {
                expires: true,
                expiration_date_from: toMercadoPagoDate(new Date(Date.now() - 60_000)),
                expiration_date_to: toMercadoPagoDate(order.expires_at),
            }),

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


        } catch (error) {

            console.error("ERRO AO CRIAR PREFERÊNCIA:", error);

            throw new PaymentCreationError();
        }
    }
}

export { CreatePreferenceService };