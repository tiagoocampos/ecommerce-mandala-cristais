import {
    melhorenvio,
    REQUIRED_SHIPPING_SERVICES,
    servicesWithRequired,
} from "../../config/melhorenvio.js";
import {
    InvalidZipCodeError,
    NoShippingOptionsError,
    ShippingUnavailableError,
} from "../../exceptions/ShippingErrors.js";
import { buildShippingProducts, MelhorEnvioProduct } from "./buildShippingProducts.js";

// Formato de resposta de POST /api/v2/me/shipment/calculate
// (https://docs.melhorenvio.com.br/reference/calculo-de-fretes-por-produtos)
export type MelhorEnvioQuote = {
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

/** PAC/SEDEX que não puderam ser cotados: o frontend mostra como indisponível. */
export type UnavailableShippingService = {
    service_id: number;
    service: string;
    company: string | null;
    reason: string;
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

const RETRY_DELAY_MS = 700;
const DEFAULT_REASON = "Sem cotação para este envio";

export function normalizeZipCode(zip: string): string {
    return zip.replace(/\D/g, "");
}

function toOption(quote: MelhorEnvioQuote): ShippingOption | null {
    const price = Number(quote.custom_price ?? quote.price);
    if (quote.error || !Number.isFinite(price) || price <= 0) return null;
    return {
        service: quote.name,
        service_id: quote.id,
        company: quote.company?.name ?? null,
        price_cents: Math.round(price * 100),
        delivery_days: quote.custom_delivery_time ?? quote.delivery_time ?? null,
    };
}

// Texto curto do erro cru do Melhor Envio (sem quebras de linha nem excesso de tamanho)
function shortReason(quote: MelhorEnvioQuote | undefined): string {
    const raw = quote?.error ?? (quote ? "Preço inválido retornado" : DEFAULT_REASON);
    return String(raw).replace(/\s+/g, " ").trim().slice(0, 140) || DEFAULT_REASON;
}

/**
 * Função pura: junta a cotação inicial com a da retentativa e separa o que é válido do que
 * ficou indisponível entre os serviços obrigatórios (PAC/SEDEX, reconhecidos pelo ID).
 */
export function buildQuoteResult(quotes: MelhorEnvioQuote[]) {
    const options = quotes
        .map(toOption)
        .filter((option): option is ShippingOption => option !== null)
        .sort((a, b) => a.price_cents - b.price_cents);

    const unavailable: UnavailableShippingService[] = [];
    for (const required of REQUIRED_SHIPPING_SERVICES) {
        if (options.some((option) => option.service_id === required.id)) continue;
        const quote = quotes.find((q) => q.id === required.id);
        unavailable.push({
            service_id: required.id,
            service: quote?.name || required.name,
            company: quote?.company?.name ?? "Correios",
            reason: shortReason(quote),
        });
    }
    return { options, unavailable };
}

export async function quoteShipping({
    destinationZipCode,
    items,
}: {
    destinationZipCode: string;
    items: QuoteItem[];
}): Promise<{ options: ShippingOption[]; unavailable: UnavailableShippingService[]; usedFallback: boolean }> {
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

    const request = (services: string, list: MelhorEnvioProduct[]) =>
        melhorenvio.post<MelhorEnvioQuote[]>("/api/v2/me/shipment/calculate", {
            from: { postal_code: from },
            to: { postal_code: to },
            products: list,
            options: { receipt: false, own_hand: false },
            ...(services && { services }),
        });

    let quotes: MelhorEnvioQuote[];
    try {
        // PAC/SEDEX sempre entram no pedido de cotação, mesmo com MELHORENVIO_SERVICES preenchida
        quotes = await request(servicesWithRequired(melhorenvio.services()), products);
    } catch (error) {
        // API fora do ar, token expirado e refresh falhou, app não autorizado, timeout...
        console.error("[frete] Erro ao cotar no Melhor Envio:", error instanceof Error ? error.message : error);
        throw new ShippingUnavailableError();
    }

    if (!Array.isArray(quotes)) {
        console.error("[frete] Resposta inesperada do Melhor Envio (não é uma lista)");
        throw new ShippingUnavailableError();
    }

    // Falha momentânea do Melhor Envio é uma das causas de PAC/SEDEX sumirem: retenta UMA vez,
    // só os serviços obrigatórios que vieram ausentes ou com erro.
    let result = buildQuoteResult(quotes);
    if (result.unavailable.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        try {
            const retry = await request(result.unavailable.map((u) => u.service_id).join(","), products);
            if (Array.isArray(retry)) {
                const retried = new Set(result.unavailable.map((u) => u.service_id));
                // a resposta da retentativa substitui a anterior só para os serviços retentados
                const merged = [...quotes.filter((q) => !retried.has(q.id)), ...retry.filter((q) => retried.has(q.id))];
                quotes = merged;
                result = buildQuoteResult(merged);
            }
        } catch (error) {
            console.warn("[frete] Retentativa de PAC/SEDEX falhou:", error instanceof Error ? error.message : error);
        }
    }

    if (result.unavailable.length > 0) {
        const totalGrams = Math.round(products.reduce((sum, p) => sum + p.weight * 1000 * p.quantity, 0));
        console.warn(
            `[frete] indisponível: ${result.unavailable.map((u) => `${u.service}(${u.service_id}): ${u.reason}`).join(" | ")} ` +
                `| CEP destino ${to} | peso total ${totalGrams} g`
        );
    }

    if (result.options.length === 0) {
        throw Object.assign(new NoShippingOptionsError(), { unavailable: result.unavailable });
    }

    return { options: result.options, unavailable: result.unavailable, usedFallback };
}
