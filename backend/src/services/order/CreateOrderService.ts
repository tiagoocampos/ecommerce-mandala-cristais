import { AddressNotFoundError } from "../../exceptions/AddressErrors.js";
import { EmptyCartError } from "../../exceptions/CartErrors.js";
import prismaClient from "../../prisma/index.js";

interface CreateOrderServiceProps {
  user_id: string;
  address_id: string;
}

class CreateOrderService {
  async execute({ user_id, address_id }: CreateOrderServiceProps) {
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

    console.log(cart)

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

    const subtotal = cart.items.reduce((total, item) => {
      const price = item.product.promo_price ?? item.product.price;

      return total + price * item.quantity;
    }, 0);

    const order = await prismaClient.order.create({
      data: {
        user_id,
        address_id,

        subtotal,
        discount: 0,
        shipping_cost: 0,
        total: subtotal,
      },
    });

    for (const item of cart.items) {
      await prismaClient.orderItem.create({
        data: {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.product.promo_price ?? item.product.price,
        },
      });
    }

    await prismaClient.cartItem.deleteMany({
      where: {
        cart_id: cart.id,
      },
    });

    return order;
  }
}

export { CreateOrderService };
