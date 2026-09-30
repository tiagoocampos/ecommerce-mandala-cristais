// ATENÇÃO — gambiarra temporária: produtos cadastrados antes do frete real não têm
// peso/dimensões. Para não travar a cotação, eles usam este pacote padrão, que pode
// não refletir o produto de verdade. O admin marca esses produtos com o badge
// "Sem peso cadastrado"; o objetivo é preencher todos e este fallback deixar de ser usado.
export const DEFAULT_PACKAGE = {
    weight_grams: 300,
    height_cm: 11,
    width_cm: 11,
    length_cm: 11,
} as const;

type CartProduct = {
    id: string;
    price: number;
    promo_price: number | null;
    weight_grams: number | null;
    height_cm: number | null;
    width_cm: number | null;
    length_cm: number | null;
};

/** Item no formato `products[]` de POST /api/v2/me/shipment/calculate (peso em kg, medidas em cm). */
export type MelhorEnvioProduct = {
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number; // valor unitário (R$) para o seguro
    quantity: number;
};

export function hasShippingData(product: Omit<CartProduct, "id" | "price" | "promo_price">): boolean {
    return !!product.weight_grams && !!product.height_cm && !!product.width_cm && !!product.length_cm;
}

// O Melhor Envio recebe os produtos individualmente e monta os volumes do lado dele
// (mais preciso que somar/empilhar medidas aqui).
export function buildShippingProducts(
    items: { quantity: number; product: CartProduct }[]
): { products: MelhorEnvioProduct[]; usedFallback: boolean } {
    let usedFallback = false;

    const products = items.map(({ quantity, product }) => {
        if (!hasShippingData(product)) usedFallback = true;
        return {
            id: product.id,
            width: product.width_cm || DEFAULT_PACKAGE.width_cm,
            height: product.height_cm || DEFAULT_PACKAGE.height_cm,
            length: product.length_cm || DEFAULT_PACKAGE.length_cm,
            weight: (product.weight_grams || DEFAULT_PACKAGE.weight_grams) / 1000,
            insurance_value: (product.promo_price ?? product.price) / 100,
            quantity,
        };
    });

    return { products, usedFallback };
}
