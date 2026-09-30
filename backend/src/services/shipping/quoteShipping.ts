import { melhorenvio } from "../../config/melhorenvio.js";
import {
    InvalidZipCodeError,
    NoShippingOptionsError,
    ShippingUnavailableError,
} from "../../exceptions/ShippingErrors.js";
import { buildShippingProducts } from "./buildShippingProducts.js";

// Formato de resposta de POST /api/v2/me/shipment/calculate
// (https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos)
type MelhorEnvioQuote = {
    id: number;
    name: string;
    price?: string; // em reais, como texto: "37.79"
    custom_price?: string; // preço com as personalizações da conta do lojista
    delivery_time?: number;
    custom_delivery_time?: number;
    company?: { id: number; name: string };
    error?: string; // presente quando o serviço não atende o envio
};

/** Contrato interno exposto ao frontend, independente do formato do Melhor Envio. */
export type ShippingOption = {
    service: string;
    service_id: number;
    company: string | null;
    price_cents: number;
    delivery_days: number | null;
};

type QuoteItem = {
    quantity: number;
    product: {
        id: string;
        price: number;
        promo_price: number | null;
        weight_grams: number | null;
        height_cm: number | null;
        width_cm: number | null;
        length_cm: number | null;
    };
};

export function normalizeZipCode(zip: string): string {
    return zip.replace(/\D/g, "");
}

export async function quoteShipping({
    destinationZipCode,
    items,
}: {
    destinationZipCode: string;
    items: QuoteItem[];
}): Promise<{ options: ShippingOption[]; usedFallback: boolean }> {
    const to = normalizeZipCode(destinationZipCode);
    if (to.length !== 8) {
        throw new InvalidZipCodeError();
    }

    const from = normalizeZipCode(melhorenvio.originZipCode());
    if (from.length !== 8) {
        console.error("[frete] STORE_ZIP_CODE ausente ou inválido no .env");
        throw new ShippingUnavailableError();
    }

    const { products, usedFallback } = buildShippingProducts(items);
    const services = melhorenvio.services();

    let quotes: MelhorEnvioQuote[];
    try {
        quotes = await melhorenvio.post<MelhorEnvioQuote[]>("/api/v2/me/shipment/calculate", {
            from: { postal_code: from },
            to: { postal_code: to },
            products,
            options: { receipt: false, own_hand: false },
            ...(services && { services }),
        });
    } catch (error) {
        // API fora do ar, token expirado e refresh falhou, app não autorizado, timeout...
        console.error("[frete] Erro ao cotar no Melhor Envio:", error);
        throw new ShippingUnavailableError();
    }

    if (!Array.isArray(quotes)) {
        console.error("[frete] Resposta inesperada do Melhor Envio:", quotes);
        throw new ShippingUnavailableError();
    }

    const options = quotes
        .map((quote) => {
            const price = Number(quote.custom_price ?? quote.price);
            return {
                valid: !quote.error && Number.isFinite(price) && price > 0,
                option: {
                    service: quote.name,
                    service_id: quote.id,
                    company: quote.company?.name ?? null,
                    price_cents: Math.round(price * 100),
                    delivery_days: quote.custom_delivery_time ?? quote.delivery_time ?? null,
                },
            };
        })
        .filter((entry) => entry.valid)
        .map((entry) => entry.option)
        .sort((a, b) => a.price_cents - b.price_cents);

    if (options.length === 0) {
        throw new NoShippingOptionsError();
    }

    return { options, usedFallback };
}
