import { EmptyCartError } from "../../exceptions/CartErrors.js";
import prismaClient from "../../prisma/index.js";
import { findAddressOrFail } from "../address/findAddressOrFail.js";
import { quoteShipping } from "./quoteShipping.js";

interface ShippingQuoteServiceProps {
    user_id: string;
    address_id: string;
}

class ShippingQuoteService {
    async execute({ user_id, address_id }: ShippingQuoteServiceProps) {
        // 404 se não existir / 403 se não for do usuário
        const address = await findAddressOrFail({ id: address_id, user_id });

        const cart = await prismaClient.cart.findUnique({
            where: { user_id },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                price: true,
                                promo_price: true,
                                weight_grams: true,
                                height_cm: true,
                                width_cm: true,
                                length_cm: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new EmptyCartError();
        }

        const { options } = await quoteShipping({
            destinationZipCode: address.zip_code,
            items: cart.items,
        });

        return options;
    }
}

export { ShippingQuoteService };
