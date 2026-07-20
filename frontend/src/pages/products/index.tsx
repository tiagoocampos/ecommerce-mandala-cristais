import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { SlidersHorizontal } from "lucide-react";
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

export function Products() {
    const navigate = useNavigate();
    const { addItem } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState<MandalaProduct[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const query = searchParams.get("q")?.toLowerCase() ?? "";
    const categorySlug = searchParams.get("categoria") ?? "";

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            setLoading(true);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get<MandalaProduct[]>("/products?disabled=false"),
                    api.get<Category[]>("/category"),
                ]);
                if (!mounted) return;
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                if (!mounted) return;
                showApiError(error, "Erro ao carregar produtos");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchData();
        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchesQuery = query ? p.name.toLowerCase().includes(query) : true;
            const matchesCategory = categorySlug
                ? p.category?.slug === categorySlug
                : true;
            return matchesQuery && matchesCategory;
        });
    }, [products, query, categorySlug]);

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

    function setCategoryFilter(slug: string) {
        const next = new URLSearchParams(searchParams);
        if (slug) {
            next.set("categoria", slug);
        } else {
            next.delete("categoria");
        }
        setSearchParams(next);
    }

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950">
                                {query ? `Resultados para "${searchParams.get("q")}"` : "Todos os produtos"}
                            </h1>
                            <p className="text-sm text-mc-ink/60 mt-1">
                                {filtered.length}{" "}
                                {filtered.length === 1 ? "produto encontrado" : "produtos encontrados"}
                            </p>
                        </div>
                        <button
                            onClick={() => setFiltersOpen((v) => !v)}
                            className="sm:hidden flex items-center gap-1.5 text-sm text-mc-violet-950 border border-mc-violet-950/15 rounded-full px-3 py-1.5"
                        >
                            <SlidersHorizontal size={14} /> Filtros
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-[200px_1fr] gap-8">
                        <aside className={`${filtersOpen ? "block" : "hidden"} sm:block`}>
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-mc-ink/50 mb-3">
                                Categorias
                            </h2>
                            <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
                                <button
                                    onClick={() => setCategoryFilter("")}
                                    className={`text-left text-sm whitespace-nowrap px-3 py-1.5 rounded-full sm:rounded-md transition-colors shrink-0 ${
                                        !categorySlug
                                            ? "bg-mc-violet-950 text-mc-sand-50"
                                            : "text-mc-ink/70 hover:bg-mc-blush-100"
                                    }`}
                                >
                                    Todas
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategoryFilter(cat.slug)}
                                        className={`text-left text-sm whitespace-nowrap px-3 py-1.5 rounded-full sm:rounded-md transition-colors shrink-0 ${
                                            categorySlug === cat.slug
                                                ? "bg-mc-violet-950 text-mc-sand-50"
                                                : "text-mc-ink/70 hover:bg-mc-blush-100"
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <div>
                            {loading ? (
                                <div className="py-16 flex justify-center">
                                    <Loading />
                                </div>
                            ) : filtered.length === 0 ? (
                                <p className="text-sm text-mc-ink/60 py-10 text-center">
                                    Nenhum produto encontrado com esses filtros.
                                </p>
                            ) : (
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-5 gap-y-8">
                                    {filtered.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            onAddToCart={handleAddToCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}
