import { AddressNotFoundError } from "../../exceptions/AddressErrors.js";
import { EmptyCartError } from "../../exceptions/CartErrors.js";
import { InsufficientStockError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";
import { calculateCartSubtotal } from "../cart/calculateCartSubtotal.js";
import { validateCoupon } from "../coupon/validateCoupon.js";
import { orderExpiresAt } from "../../utils/orderExpiration.js";
import { quoteShipping } from "../shipping/quoteShipping.js";
import { ShippingServiceNotAvailableError, ShippingUnavailableError } from "../../exceptions/ShippingErrors.js";

interface CreateOrderServiceProps {
  user_id: string;
  address_id: string;
  coupon_code?: string;
  /** nome do serviço escolhido no checkout, ex.: "PAC" */
  shipping_service: string;
  /** último preço cotado na tela — usado SÓ se o Melhor Envio cair na hora de finalizar */
  shipping_quote_cents?: number;
}

class CreateOrderService {
  async execute({ user_id, address_id, coupon_code, shipping_service, shipping_quote_cents }: CreateOrderServiceProps) {
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



    if (!cart || cart.items.length === 0) {
      throw new EmptyCartError();
    }



    const address = await prismaClient.address.findFirst({
      where: {
        id: address_id,
        user_id,
      },
    });

    if (!address) {
      throw new AddressNotFoundError();
    }

    const subtotal = calculateCartSubtotal(cart.items);

    // Checagem rápida só para responder cedo; a garantia real é o updateMany
    // condicional dentro da transação (abaixo), que resolve compras simultâneas.
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw new InsufficientStockError();
      }
    }

    // Desconto sempre recalculado aqui — nunca confiar em valor vindo do frontend
    let discount = 0;
    let coupon_id: string | null = null;
    if (coupon_code) {
      const result = await validateCoupon({ code: coupon_code, user_id, subtotal });
      discount = result.discount;
      coupon_id = result.coupon.id;
    }

    // Frete sempre recotado aqui — nunca confiar no preço vindo do frontend
    let shipping_cost: number;
    let shipping_delivery_days: number | null = null;
    let shipping_cost_estimated = false;
    try {
      const { options } = await quoteShipping({
        destinationZipCode: address.zip_code,
        items: cart.items,
      });
      const chosen = options.find((option) => option.service === shipping_service);
      if (!chosen) {
        // preço mudou / serviço saiu do ar desde a cotação na tela
        throw new ShippingServiceNotAvailableError();
      }
      shipping_cost = chosen.price_cents;
      shipping_delivery_days = chosen.delivery_days;
    } catch (error) {
      // DECISÃO DE NEGÓCIO: se o Melhor Envio estiver fora do ar bem na hora de finalizar
      // (o cliente já viu uma cotação na tela), preferimos não perder a venda. Gravamos
      // o último valor cotado enviado pelo frontend e marcamos o pedido com
      // shipping_cost_estimated = true para o admin conferir o frete antes de enviar.
      // Vale SÓ para indisponibilidade da API — serviço inexistente, CEP inválido
      // ou falta de opções continuam bloqueando o pedido.
      const canUseQuotedFallback =
        error instanceof ShippingUnavailableError &&
        typeof shipping_quote_cents === "number" &&
        shipping_quote_cents > 0;
      if (!canUseQuotedFallback) {
        throw error;
      }
      console.warn(
        `[frete] Melhor Envio indisponível ao criar pedido do usuário ${user_id}; usando frete cotado na tela (${shipping_quote_cents} centavos, ${shipping_service}).`
      );
      shipping_cost = shipping_quote_cents!;
      shipping_cost_estimated = true;
    }


    // RISCO ACEITO: subtotal, unit_price, cupom e frete usam os preços lidos do carrinho
    // logo acima. Se o admin mudar o preço de um produto no intervalo de milissegundos
    // entre essa leitura e a transação, o pedido sai com o preço anterior. Revalidar
    // aqui exigiria recalcular cupom e frete dentro da transação; não compensa.

    // Transação: reserva o estoque (atômica) + cria o pedido + esvazia o carrinho.
    const transaction = await prismaClient.$transaction(async (tx) => {
      // Reserva atômica: só baixa se ainda houver estoque suficiente (e o produto ativo).
      // Duas compras simultâneas da última peça: uma passa, a outra recebe count 0,
      // e a transação inteira é desfeita — o estoque nunca fica negativo.
      for (const item of cart.items) {
        const reserved = await tx.product.updateMany({
          where: { id: item.product_id, stock: { gte: item.quantity }, disabled: false },
          data: { stock: { decrement: item.quantity } },
        });
        if (reserved.count === 0) {
          throw new InsufficientStockError();
        }
      }

      const order = await tx.order.create({
        data: {
          user_id,
          address_id,

          subtotal,
          discount,
          shipping_cost,
          shipping_service,
          shipping_delivery_days,
          shipping_cost_estimated,
          // desconto (cupom) vale sobre os produtos; o frete é somado depois
          total: Math.max(0, subtotal - discount) + shipping_cost,
          coupon_id,
          // reserva vale até aqui; depois o job de expiração cancela e devolve o estoque
          expires_at: orderExpiresAt(),

          payment: {
            create: {
              status: "PENDING",
              provider: "mercado_pago",
            },
          },
        },
        include: {
          payment: true,
        },
      });



      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.product.promo_price ?? item.product.price,
          },
        });
      }



      await tx.cartItem.deleteMany({
        where: {
          cart_id: cart.id,
        },
      });

      return order;

    })

    return transaction;


  }
}

export { CreateOrderService };
