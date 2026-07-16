// Extensão do types/index.ts do Coffee Shop para o domínio do Mandala Cristais.
// Mescle estes campos no seu types/index.ts existente (ou substitua a
// interface Product de lá por esta).

export interface MandalaProduct {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number; // em centavos
    promo_price?: number | null; // em centavos, se houver desconto
    stock: number;
    banner: string;
    disabled?: boolean;
    category_id?: string;
    category?: {
        name: string;
        slug: string;
    };
    rating?: number; // 0-5, opcional (média de avaliações)
    createdAt?: string;
}

export function discountPercent(price: number, promoPrice: number): number {
    return Math.round(((price - promoPrice) / price) * 100);
}
