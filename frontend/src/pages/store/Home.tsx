import { useState } from "react";
import { toast } from "sonner";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { Hero } from "../../components/store/Hero";
import { TrustStrip } from "../../components/store/TrustStrip";
import { CategoryStrip } from "../../components/store/CategoryStrip";
import { ProductGrid } from "../../components/store/ProductGrid";
import { PromoBanner } from "../../components/store/PromoBanner";
import { StoreFooter } from "../../components/store/StoreFooter";
import type { MandalaProduct } from "../../types/mandala";

// ---------------------------------------------------------------
// MOCK DE PRODUTOS — apenas para visualização do layout.
// Substituir por uma chamada real, ex:
//   const { data } = await api.get<MandalaProduct[]>("/products");
// assim que o backend do módulo Product estiver pronto.
// ---------------------------------------------------------------
const MOCK_PRODUCTS: MandalaProduct[] = [
    {
        id: "1",
        name: "Tigela Selenita Branca Bowl 7cm — Limpeza Energética",
        slug: "tigela-selenita-bowl-7cm",
        description: "Tigela de selenita para limpeza energética de outras pedras.",
        price: 12600,
        promo_price: 11088,
        stock: 8,
        banner: "",
        rating: 5,
    },
    {
        id: "2",
        name: "Pêndulo Pingente Selenita — Limpeza Energética",
        slug: "pendulo-pingente-selenita",
        description: "Pêndulo em selenita natural para práticas de radiestesia.",
        price: 3850,
        promo_price: 3465,
        stock: 14,
        banner: "",
        rating: 5,
    },
    {
        id: "3",
        name: "Bastão Selenita Branca Bruta G — 15cm",
        slug: "bastao-selenita-bruta-15cm",
        description: "Bastão bruto de selenita, ideal para ambientes e altares.",
        price: 3000,
        promo_price: 2550,
        stock: 0,
        banner: "",
        rating: 5,
    },
    {
        id: "4",
        name: "Ponta Ametista Natural Média",
        slug: "ponta-ametista-natural-media",
        description: "Ponta de ametista natural, ótima para meditação.",
        price: 8900,
        stock: 21,
        banner: "",
        rating: 4,
    },
    {
        id: "5",
        name: "Kit Iniciante — 5 Pedras Essenciais",
        slug: "kit-iniciante-5-pedras",
        description: "Seleção com as 5 pedras mais indicadas para quem está começando.",
        price: 14900,
        promo_price: 12900,
        stock: 30,
        banner: "",
        rating: 5,
    },
    {
        id: "6",
        name: "Incenso Palo Santo — Caixa com 4 unidades",
        slug: "incenso-palo-santo-4un",
        description: "Palo santo natural para limpeza e purificação de ambientes.",
        price: 4200,
        stock: 40,
        banner: "",
        rating: 4,
    },
    {
        id: "7",
        name: "Quartzo Rosa Rolado — Amor Próprio",
        slug: "quartzo-rosa-rolado",
        description: "Pedra rolada de quartzo rosa, associada ao amor próprio.",
        price: 2500,
        stock: 50,
        banner: "",
        rating: 5,
    },
    {
        id: "8",
        name: "Pirita Bruta — Prosperidade",
        slug: "pirita-bruta-prosperidade",
        description: "Pedra bruta de pirita, associada à prosperidade e abundância.",
        price: 3200,
        stock: 12,
        banner: "",
        rating: 4,
    },
];

export function MandalaHome() {
    const [cartCount, setCartCount] = useState(0);

    function handleAddToCart(product: MandalaProduct) {
        setCartCount((c) => c + 1);
        toast.success(`${product.name} adicionado ao carrinho`, {
            position: "top-center",
        });
    }

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader cartCount={cartCount} />

            <main className="flex-1">
                <Hero />
                <TrustStrip />
                <CategoryStrip />
                <ProductGrid
                    title="Selenita, a pedra queridinha"
                    subtitle="Os itens mais procurados da semana"
                    products={MOCK_PRODUCTS.slice(0, 4)}
                    seeAllHref="/categoria/pedras"
                    onAddToCart={handleAddToCart}
                />
                <PromoBanner />
                <ProductGrid
                    title="Para começar sua jornada"
                    subtitle="Recomendados para quem está dando os primeiros passos"
                    products={MOCK_PRODUCTS.slice(4, 8)}
                    seeAllHref="/categoria/iniciante"
                    onAddToCart={handleAddToCart}
                />
            </main>

            <StoreFooter />
        </div>
    );
}
