import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ShoppingBag, Minus, Plus, ChevronRight, SearchX, Truck, ShieldCheck, Gem } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { EmptyState } from "../../components/store/EmptyState";
import { ProductImage } from "../../components/store/ProductImage";
import { Button } from "../../components/ui/button";
import { api } from "../../services/api";
import { formatPrice, showApiError } from "../../lib/utils-api";
import { useAddToCart } from "../../hooks/useAddToCart";
import { discountPercent } from "../../types/mandala";
import type { MandalaProduct } from "../../types/mandala";

function ProductDetailSkeleton() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse" role="status" aria-label="Carregando produto">
            <div className="h-4 w-56 rounded bg-mc-blush-100 mb-6 sm:mb-8" />
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
                <div className="facet-cut aspect-square bg-mc-blush-100" />
                <div>
                    <div className="h-3 w-24 rounded bg-mc-blush-200 mb-3" />
                    <div className="h-9 w-3/4 rounded bg-mc-blush-100 mb-5" />
                    <div className="h-8 w-40 rounded bg-mc-blush-200 mb-2" />
                    <div className="h-4 w-48 rounded bg-mc-blush-100 mb-8" />
                    <div className="space-y-2 mb-8">
                        <div className="h-3.5 w-full rounded bg-mc-blush-100" />
                        <div className="h-3.5 w-full rounded bg-mc-blush-100" />
                        <div className="h-3.5 w-2/3 rounded bg-mc-blush-100" />
                    </div>
                    <div className="h-12 w-56 rounded bg-mc-blush-200" />
                </div>
            </div>
        </div>
    );
}

export function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const addToCart = useAddToCart();

    const [product, setProduct] = useState<MandalaProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function fetchProduct() {
            setLoading(true);
            try {
                const res = await api.get<MandalaProduct[]>("/products?disabled=false");
                if (!mounted) return;
                const found = res.data.find((p) => p.slug === slug) ?? null;
                setProduct(found);
                setQuantity(1);
            } catch (error) {
                if (!mounted) return;
                showApiError(error, "Erro ao carregar produto");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchProduct();
        return () => {
            mounted = false;
        };
    }, [slug]);

    async function handleAddToCart() {
        if (!product) return;
        setAdding(true);
        await addToCart(product.id, quantity);
        setAdding(false);
    }

    if (loading || !product) {
        return (
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />
                <main className="flex-1">
                    {loading ? (
                        <ProductDetailSkeleton />
                    ) : (
                        <EmptyState
                            icon={SearchX}
                            title="Essa pedra não está aqui"
                            description="O produto que você procura não existe ou não está mais disponível."
                            actionLabel="Ver todos os produtos"
                            onAction={() => navigate("/produtos")}
                            className="py-20 px-4"
                        />
                    )}
                </main>
                <StoreFooter />
            </div>
        );
    }

    const hasPromo = !!product.promo_price && product.promo_price < product.price;
    const finalPrice = hasPromo ? product.promo_price! : product.price;
    const outOfStock = product.stock === 0;
    const addLabel = outOfStock ? "Indisponível" : adding ? "Adicionando..." : "Adicionar ao carrinho";

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            {/* pb extra no mobile para a barra fixa de compra não cobrir o conteúdo */}
            <main className="flex-1 pb-24 lg:pb-0">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <nav aria-label="Você está em" className="mb-5 sm:mb-8">
                        <ol className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-mc-ink/60">
                            <li>
                                <Link to="/" className="hover:text-mc-violet-950">Início</Link>
                            </li>
                            <li aria-hidden="true"><ChevronRight size={13} /></li>
                            {product.category?.slug ? (
                                <>
                                    <li>
                                        <Link to={`/categoria/${product.category.slug}`} className="hover:text-mc-violet-950">
                                            {product.category.name}
                                        </Link>
                                    </li>
                                    <li aria-hidden="true"><ChevronRight size={13} /></li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link to="/produtos" className="hover:text-mc-violet-950">Produtos</Link>
                                    </li>
                                    <li aria-hidden="true"><ChevronRight size={13} /></li>
                                </>
                            )}
                            <li aria-current="page" className="text-mc-violet-950 font-medium line-clamp-1">
                                {product.name}
                            </li>
                        </ol>
                    </nav>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
                        {/* imagem (galeria futura entra aqui) */}
                        <div className="relative facet-cut overflow-hidden bg-mc-blush-100 aspect-square">
                            <ProductImage src={product.banner} alt={product.name} iconSize={64} />
                            {hasPromo && (
                                <span className="absolute top-4 left-4 bg-mc-gold-500 text-mc-violet-950 text-xs font-bold px-2.5 py-1 rounded-full">
                                    -{discountPercent(product.price, product.promo_price!)}%
                                </span>
                            )}
                            {outOfStock && (
                                <span className="absolute inset-0 bg-mc-ink/50 flex items-center justify-center text-mc-sand-50 text-sm font-semibold tracking-wide uppercase">
                                    Esgotado
                                </span>
                            )}
                        </div>

                        {/* info */}
                        <div>
                            {product.category?.name && (
                                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-mc-gold-700">
                                    {product.category.name}
                                </span>
                            )}

                            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-mc-violet-950 mt-2 mb-3">
                                {product.name}
                            </h1>

                            <div className="mb-6">
                                {hasPromo && (
                                    <span className="text-base text-mc-ink/40 line-through mr-2">
                                        {formatPrice(product.price)}
                                    </span>
                                )}
                                <span className="text-3xl font-semibold text-mc-violet-950">
                                    {formatPrice(finalPrice)}
                                </span>
                                <p className="text-sm text-mc-ink/50 mt-1">
                                    ou 3x de {formatPrice(Math.round(finalPrice / 3))} sem juros
                                </p>
                            </div>

                            <p className="text-sm text-mc-ink/70 leading-relaxed mb-8 whitespace-pre-line">
                                {product.description}
                            </p>

                            {!outOfStock && (
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-sm text-mc-ink/60" id="qty-label">Quantidade</span>
                                    <div
                                        className="flex items-center border border-mc-violet-950/15 rounded-full bg-white"
                                        role="group"
                                        aria-labelledby="qty-label"
                                    >
                                        <button
                                            type="button"
                                            aria-label="Diminuir quantidade"
                                            disabled={quantity <= 1}
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            className="w-9 h-9 flex items-center justify-center text-mc-violet-950 hover:bg-mc-blush-100 rounded-full disabled:opacity-40"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium" aria-live="polite">
                                            {quantity}
                                        </span>
                                        <button
                                            type="button"
                                            aria-label="Aumentar quantidade"
                                            disabled={quantity >= product.stock}
                                            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                            className="w-9 h-9 flex items-center justify-center text-mc-violet-950 hover:bg-mc-blush-100 rounded-full disabled:opacity-40"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <span className="text-xs text-mc-ink/50">
                                        {product.stock} em estoque
                                    </span>
                                </div>
                            )}

                            <Button
                                disabled={outOfStock || adding}
                                onClick={handleAddToCart}
                                className="hidden lg:inline-flex facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none px-8 py-6 text-sm font-medium disabled:opacity-40"
                            >
                                <ShoppingBag size={16} className="mr-2" />
                                {addLabel}
                            </Button>

                            <ul className="mt-8 grid gap-3 border-t border-mc-violet-950/10 pt-6 text-sm text-mc-ink/70">
                                <li className="flex items-center gap-2.5">
                                    <Gem size={16} className="text-mc-violet-700 shrink-0" /> Pedra 100% natural, selecionada à mão
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Truck size={16} className="text-mc-violet-700 shrink-0" /> Envio rápido para todo o Brasil
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <ShieldCheck size={16} className="text-mc-violet-700 shrink-0" /> Compra protegida e pagamento seguro
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* barra fixa de compra no mobile */}
            <div className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t border-mc-violet-950/10 bg-white/95 backdrop-blur-md px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-3 max-w-6xl mx-auto">
                    <div className="min-w-0">
                        {hasPromo && (
                            <span className="block text-[11px] text-mc-ink/40 line-through leading-none">
                                {formatPrice(product.price)}
                            </span>
                        )}
                        <span className="block text-lg font-semibold text-mc-violet-950 leading-tight">
                            {formatPrice(finalPrice)}
                        </span>
                    </div>
                    <Button
                        disabled={outOfStock || adding}
                        onClick={handleAddToCart}
                        className="ml-auto flex-1 max-w-xs facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none h-11 text-sm font-medium disabled:opacity-40"
                    >
                        <ShoppingBag size={16} className="mr-1.5" />
                        {outOfStock ? "Indisponível" : adding ? "Adicionando..." : quantity > 1 ? `Adicionar (${quantity})` : "Adicionar"}
                    </Button>
                </div>
            </div>

            <StoreFooter />
        </div>
    );
}
