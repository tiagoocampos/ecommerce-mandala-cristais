import { AddressNotFoundError } from "../../exceptions/AddressErrors.js";
import { EmptyCartError } from "../../exceptions/CartErrors.js";
import { InsufficientStockError } from "../../exceptions/OrdersErrors.js";
import prismaClient from "../../prisma/index.js";
import { calculateCartSubtotal } from "../cart/calculateCartSubtotal.js";
import { validateCoupon } from "../coupon/validateCoupon.js";
class CreateOrderService {
    async execute({ user_id, address_id, coupon_code }) {
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
        for (const item of cart.items) {
            if (item.product.stock < item.quantity) {
                throw new InsufficientStockError();
            }
        }
        // Desconto sempre recalculado aqui — nunca confiar em valor vindo do frontend
        let discount = 0;
        let coupon_id = null;
        if (coupon_code) {
            const result = await validateCoupon({ code: coupon_code, user_id, subtotal });
            discount = result.discount;
            coupon_id = result.coupon.id;
        }
        //parte de transação
        const transaction = await prismaClient.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    user_id,
                    address_id,
                    subtotal,
                    discount,
                    shipping_cost: 0,
                    total: Math.max(0, subtotal - discount),
                    coupon_id,
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
                await tx.product.update({
                    where: {
                        id: item.product_id,
                    },
                    data: {
                        stock: {
                            decrement: item.quantity,
                        }
                    },
                });
            }
            await tx.cartItem.deleteMany({
                where: {
                    cart_id: cart.id,
                },
            });
            return order;
        });
        return transaction;
    }
}
export { CreateOrderService };
//# sourceMappingURL=CreateOrderService.js.map