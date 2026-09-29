import { useEffect, useMemo, useState } from "react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { Hero } from "../../components/store/Hero";
import { TrustStrip } from "../../components/store/TrustStrip";
import { CategoryStrip } from "../../components/store/CategoryStrip";
import { ProductGrid } from "../../components/store/ProductGrid";
import { PromoBanner } from "../../components/store/PromoBanner";
import { StoreFooter } from "../../components/store/StoreFooter";
import { EmptyState } from "../../components/store/EmptyState";
import { Gem } from "lucide-react";
import { api } from "../../services/api";
import { useAddToCart } from "../../hooks/useAddToCart";
import type { MandalaProduct } from "../../types/mandala";

export function MandalaHome() {
  const addToCart = useAddToCart();
  const [products, setProducts] = useState<MandalaProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  function handleAddToCart(product: MandalaProduct) {
    addToCart(product.id);
  }

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      try {
        const res = await api.get<MandalaProduct[]>("/products?disabled=false");
        if (!mounted) return;
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (!mounted) return;
        setProducts([]);
      } finally {
        if (!mounted) return;
        setLoadingProducts(false);
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const topPicks = useMemo(() => products.slice(0, 4), [products]);
  const forBeginners = useMemo(() => products.slice(4, 8), [products]);

  return (
    <div className="min-h-screen bg-mc-sand-50 flex flex-col">
      <AnnouncementBar />
      <StoreHeader />

      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <CategoryStrip />

        {!loadingProducts && products.length === 0 ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
            <EmptyState
              icon={Gem}
              title="Nossa vitrine está sendo preparada"
              description="Nenhum produto disponível no momento. Volte em breve!"
            />
          </section>
        ) : (
          <>
            <ProductGrid
              title="Escolhas da semana"
              subtitle="Os itens mais procurados da semana"
              products={topPicks}
              loading={loadingProducts}
              seeAllHref="/produtos"
              onAddToCart={handleAddToCart}
            />

            <PromoBanner />

            <ProductGrid
              title="Para começar sua jornada"
              subtitle="Recomendados para quem está dando os primeiros passos"
              products={forBeginners}
              loading={loadingProducts}
              seeAllHref="/produtos"
              onAddToCart={handleAddToCart}
            />
          </>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
