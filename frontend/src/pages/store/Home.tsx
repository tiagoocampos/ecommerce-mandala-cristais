import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { getToken } from "../../lib/auth";
import { useCart } from "../../contexts/CartContext";
import type { MandalaProduct } from "../../types/mandala";

export function MandalaHome() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<MandalaProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  async function handleAddToCart(product: MandalaProduct) {
    if (!getToken()) {
      toast.info("Entre na sua conta para adicionar ao carrinho", {
        position: "top-center",
      });
      navigate("/login");
      return;
    }

    try {
      await addItem(product.id, 1);
      toast.success(`${product.name} adicionado ao carrinho`, {
        position: "top-center",
      });
    } catch {
      toast.error("Não foi possível adicionar ao carrinho", {
        position: "top-center",
      });
    }
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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 text-center">
            <p className="text-mc-ink/60">
              Nenhum produto disponível no momento. Volte em breve!
            </p>
          </section>
        ) : (
          <>
            <ProductGrid
              title="Selenita, a pedra queridinha"
              subtitle="Os itens mais procurados da semana"
              products={loadingProducts ? [] : topPicks}
              seeAllHref="/produtos"
              onAddToCart={handleAddToCart}
            />

            <PromoBanner />

            <ProductGrid
              title="Para começar sua jornada"
              subtitle="Recomendados para quem está dando os primeiros passos"
              products={loadingProducts ? [] : forBeginners}
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
