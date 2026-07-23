import { Preference } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import prismaClient from "../../prisma/index.js";
import { OrderNotFoundError } from "../../exceptions/OrdersErrors.js";

interface CreatePreferenceServiceProps {
    order_id: string;
    user_id: string;
}



class CreatePreferenceService {
    async execute({ order_id, user_id }: CreatePreferenceServiceProps) {

        const frontendUrl = process.env.FRONTEND_URL as string;

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

        const items = order.items.map((item) => {
            return {
                id: item.product.id,
                title: item.product.name,
                unit_price: item.unit_price / 100,
                quantity: item.quantity,
                currency_id: "BRL",
            };
        });

        const preferenceData = {
            items,
            external_reference: order.id,
            back_urls: {
                success: `${frontendUrl}/payment/success`,
                failure: `${frontendUrl}/payment/failure`,
                pending: `${frontendUrl}/payment/pending`,
            },
            auto_return: "approved",
        };

        console.log(preferenceData);
        try {
            const preference = new Preference(client)
            const response = await preference.create({
                body: preferenceData,

            });



            const paymentExists = await prismaClient.payment.findUnique({
                where: {
                    order_id: order.id,
                },
            });

            if (!response.id) {
                throw new Error("A preferência foi criada, mas o Mercado Pago não retornou um ID.");
            }

            if (!paymentExists) {
                await prismaClient.payment.create({
                    data: {
                        order_id: order.id,
                        provider_payment_id: response.id,
                    },
                });
            }



            return {
                order_id: order.id,
                checkout_url: response.sandbox_init_point,
            };
        } catch (error) {
            console.error(error);
            throw new Error;
        }


        // return response;

    }
}

export { CreatePreferenceService };