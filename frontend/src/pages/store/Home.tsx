import { useCallback, useEffect, useMemo, useState } from "react";
import { Gem } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { Hero } from "../../components/store/Hero";
import { FeaturedProducts } from "../../components/store/FeaturedProducts";
import { TrustStrip } from "../../components/store/TrustStrip";
import { AboutSection } from "../../components/store/AboutSection";
import { Reveal } from "../../components/store/Reveal";
import { StoreFooter } from "../../components/store/StoreFooter";
import { EmptyState } from "../../components/store/EmptyState";
import { api } from "../../services/api";
import { useAddToCart } from "../../hooks/useAddToCart";
import type { MandalaProduct } from "../../types/mandala";

export function MandalaHome() {
  const addToCart = useAddToCart();
  const [products, setProducts] = useState<MandalaProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(false);

  function handleAddToCart(product: MandalaProduct) {
    return addToCart(product.id);
  }

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setError(false);
    try {
      const res = await api.get<MandalaProduct[]>("/products?disabled=false");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setProducts([]);
      setError(true);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Destaques: produtos marcados no admin; se nenhum estiver marcado, os primeiros da loja
  const featured = useMemo(() => {
    const marked = products.filter((p) => p.featured);
    return marked.length > 0 ? marked : products.slice(0, 12);
  }, [products]);

  const emptyStore = !loadingProducts && !error && products.length === 0;

  return (
    <div className="min-h-screen bg-mc-sand-50 flex flex-col">
      <AnnouncementBar />
      <StoreHeader />

      <main className="flex-1">
        <Hero />

        {emptyStore ? (
          <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <EmptyState
              icon={Gem}
              title="Nossa vitrine está sendo preparada"
              description="Nenhum produto disponível no momento. Volte em breve!"
            />
          </section>
        ) : (
          <Reveal>
            <FeaturedProducts
              products={featured}
              loading={loadingProducts}
              error={error}
              onRetry={fetchProducts}
              onAddToCart={handleAddToCart}
            />
          </Reveal>
        )}

        <TrustStrip />
        <Reveal>
          <AboutSection />
        </Reveal>
      </main>

      <StoreFooter />
    </div>
  );
}
