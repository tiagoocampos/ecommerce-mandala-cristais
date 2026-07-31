import { Payment } from "mercadopago";
import { client } from "../../config/mercadopago.js";
import prismaClient from "../../prisma/index.js";
import { OrderStatus, PaymentStatus } from "../../generated/prisma/enums.js";

class WebhookService {
    async execute(body: any) {
        try {
            console.log("===== WEBHOOK RECEBIDO =====");
            console.log(JSON.stringify(body, null, 2));


            const topic = body.type ?? body.topic;

            console.log("TOPIC RECEBIDO:", topic);


            if (topic !== "payment") {
                console.log("Evento ignorado:", topic);
                return;
            }


            let paymentId: number;


            if (body.data?.id) {
                paymentId = Number(body.data.id);

            } else if (body.resource) {

                paymentId = Number(
                    body.resource.split("/").pop()
                );

            } else {

                console.log("Sem payment id");
                return;
            }


            if (!paymentId || Number.isNaN(paymentId)) {
                console.log("Payment ID inválido:", paymentId);
                return;
            }


            console.log("PAYMENT ID:", paymentId);


            const payment = new Payment(client);


            const paymentInfo = await payment.get({
                id: paymentId,
            });


            console.log("===== DADOS PAGAMENTO =====");

            console.log({
                id: paymentInfo.id,
                status: paymentInfo.status,
                external_reference: paymentInfo.external_reference,
                method: paymentInfo.payment_method_id,
            });



            const orderId = paymentInfo.external_reference;


            if (!orderId) {
                console.log("Sem external_reference");
                return;
            }


            console.log("BUSCANDO ORDER:", orderId);


            const order = await prismaClient.order.findUnique({
                where: {
                    id: orderId,
                },
            });


            if (!order) {
                console.log(
                    "PEDIDO NÃO ENCONTRADO:",
                    orderId
                );
                return;
            }


            console.log(
                "ORDER ENCONTRADA:",
                order.id
            );



            const existingPayment =
                await prismaClient.payment.findUnique({
                    where: {
                        order_id: orderId,
                    },
                });



            if (!existingPayment) {

                console.log(
                    "PAYMENT NÃO ENCONTRADO PARA ORDER:",
                    orderId
                );

                return;
            }



            console.log(
                "PAYMENT INTERNO:",
                existingPayment.id
            );



            const payload = JSON.parse(
                JSON.stringify(paymentInfo)
            );



            if (paymentInfo.status === "approved") {


                await prismaClient.$transaction([

                    prismaClient.order.update({

                        where: {
                            id: orderId,
                        },

                        data: {
                            status: OrderStatus.PAID,
                        },

                    }),



                    prismaClient.payment.update({

                        where: {
                            order_id: orderId,
                        },

                        data: {

                            status: PaymentStatus.APPROVED,

                            provider_payment_id:
                                String(paymentInfo.id),

                            method:
                                paymentInfo.payment_method_id ?? null,

                            raw_payload:
                                payload,

                        },

                    }),

                ]);



                console.log(
                    "✅ PEDIDO PAGO:",
                    orderId
                );


                return;
            }




            if (paymentInfo.status === "rejected") {


                await prismaClient.payment.update({

                    where: {
                        order_id: orderId,
                    },

                    data: {

                        status: PaymentStatus.REJECTED,

                        provider_payment_id:
                            String(paymentInfo.id),

                        method:
                            paymentInfo.payment_method_id ?? null,

                        raw_payload:
                            payload,

                    },

                });


                console.log(
                    "❌ PAGAMENTO RECUSADO:",
                    orderId
                );


                return;
            }





            await prismaClient.payment.update({

                where: {
                    order_id: orderId,
                },

                data: {

                    status: PaymentStatus.PENDING,

                    provider_payment_id:
                        String(paymentInfo.id),

                    method:
                        paymentInfo.payment_method_id ?? null,

                    raw_payload:
                        payload,

                },

            });



            console.log(
                "⏳ PAGAMENTO PENDENTE:",
                orderId
            );



        } catch (error) {

            console.error(
                "ERRO NO WEBHOOK:",
                error
            );

            throw error;
        }
    }
}


export { WebhookService };