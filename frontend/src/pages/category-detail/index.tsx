import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { ProductCard } from "../../components/store/ProductCard";
import { Loading } from "../../components/Loading";
import { api } from "../../services/api";
import { getToken } from "../../lib/auth";
import { showApiError } from "../../lib/utils-api";
import { useCart } from "../../contexts/CartContext";
import type { MandalaProduct } from "../../types/mandala";
import type { Category } from "../../types";

export function CategoryDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

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
        } catch (error) {
            showApiError(error, "Não foi possível adicionar ao carrinho");
        }
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
                        <div className="py-16 flex justify-center">
                            <Loading />
                        </div>
                    ) : !category ? (
                        <p className="text-sm text-mc-ink/60 py-10 text-center">
                            Categoria não encontrada.
                        </p>
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
                                <p className="text-sm text-mc-ink/60 py-10 text-center">
                                    Nenhum produto nesta categoria ainda.
                                </p>
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
