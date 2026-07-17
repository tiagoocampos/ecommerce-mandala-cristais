import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { Hero } from "../../components/store/Hero";
import { TrustStrip } from "../../components/store/TrustStrip";
import { CategoryStrip } from "../../components/store/CategoryStrip";
import { ProductGrid } from "../../components/store/ProductGrid";
import { PromoBanner } from "../../components/store/PromoBanner";
import { StoreFooter } from "../../components/store/StoreFooter";
import { api } from "../../services/api";
import type { MandalaProduct } from "../../types/mandala";

export function MandalaHome() {
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<MandalaProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  function handleAddToCart(product: MandalaProduct) {
    setCartCount((c) => c + 1);
    toast.success(`${product.name} adicionado ao carrinho`, {
      position: "top-center",
    });
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
      <StoreHeader cartCount={cartCount} />

      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <CategoryStrip />

        <ProductGrid
          title="Selenita, a pedra queridinha"
          subtitle="Os itens mais procurados da semana"
          products={loadingProducts ? [] : topPicks}
          seeAllHref="/categoria/pedras"
          onAddToCart={handleAddToCart}
        />

        <PromoBanner />

        <ProductGrid
          title="Para começar sua jornada"
          subtitle="Recomendados para quem está dando os primeiros passos"
          products={loadingProducts ? [] : forBeginners}
          seeAllHref="/categoria/iniciante"
          onAddToCart={handleAddToCart}
        />
      </main>

      <StoreFooter />
    </div>
  );
}

