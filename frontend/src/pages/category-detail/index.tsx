import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Gem, SearchX } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { ProductCard } from "../../components/store/ProductCard";
import { ProductGridSkeleton } from "../../components/store/ProductCardSkeleton";
import { EmptyState } from "../../components/store/EmptyState";
import { api } from "../../services/api";
import { showApiError } from "../../lib/utils-api";
import { useAddToCart } from "../../hooks/useAddToCart";
import type { MandalaProduct } from "../../types/mandala";
import type { Category } from "../../types";

export function CategoryDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const addToCart = useAddToCart();

    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<MandalaProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            setLoading(true);
            try {
                const { data: categories } = await api.get<Category[]>("/category");
                const found = categories.find((c) => c.slug === slug) ?? null;
                if (!mounted) return;
                setCategory(found);

                if (found) {
                    const { data: products } = await api.get<MandalaProduct[]>(
                        `/category/product?category_id=${found.id}`
                    );
                    if (!mounted) return;
                    setProducts(products);
                }
            } catch (error) {
                if (!mounted) return;
                showApiError(error, "Erro ao carregar categoria");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchData();
        return () => {
            mounted = false;
        };
    }, [slug]);

    function handleAddToCart(product: MandalaProduct) {
        addToCart(product.id);
    }

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <button
                        onClick={() => navigate("/categorias")}
                        className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5"
                    >
                        <ArrowLeft size={15} /> Todas as categorias
                    </button>

                    {loading ? (
                        <>
                            <div className="h-8 w-48 rounded bg-mc-blush-100 animate-pulse mb-2" />
                            <div className="h-4 w-24 rounded bg-mc-blush-100 animate-pulse mb-6" />
                            <ProductGridSkeleton
                                count={4}
                                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-8"
                            />
                        </>
                    ) : !category ? (
                        <EmptyState
                            icon={SearchX}
                            title="Categoria não encontrada"
                            description="Ela pode ter mudado de nome ou não existir mais."
                            actionLabel="Ver todas as categorias"
                            onAction={() => navigate("/categorias")}
                        />
                    ) : (
                        <>
                            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-1">
                                {category.name}
                            </h1>
                            <p className="text-sm text-mc-ink/60 mb-6">
                                {products.length}{" "}
                                {products.length === 1 ? "produto" : "produtos"}
                            </p>

                            {products.length === 0 ? (
                                <EmptyState
                                    icon={Gem}
                                    title="Nenhum produto nesta categoria ainda"
                                    description="Novas pedras chegam com frequência — enquanto isso, explore o restante da coleção."
                                    actionLabel="Ver produtos"
                                    onAction={() => navigate("/produtos")}
                                />
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-5 gap-y-8">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}
