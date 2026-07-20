import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Star, ShoppingBag, Minus, Plus, ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { api } from "../../services/api";
import { getToken } from "../../lib/auth";
import { formatPrice, showApiError } from "../../lib/utils-api";
import { useCart } from "../../contexts/CartContext";
import { discountPercent } from "../../types/mandala";
import type { MandalaProduct } from "../../types/mandala";

export function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();

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

        if (!getToken()) {
            toast.info("Entre na sua conta para adicionar ao carrinho", {
                position: "top-center",
            });
            navigate("/login");
            return;
        }

        setAdding(true);
        try {
            await addItem(product.id, quantity);
            toast.success(`${product.name} adicionado ao carrinho`, {
                position: "top-center",
            });
        } catch (error) {
            showApiError(error, "Não foi possível adicionar ao carrinho");
        } finally {
            setAdding(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />
                <div className="flex-1 flex items-center justify-center py-20">
                    <Loading />
                </div>
                <StoreFooter />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />
                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-4 px-4 text-center">
                    <p className="text-mc-ink/70">Produto não encontrado.</p>
                    <Button
                        onClick={() => navigate("/produtos")}
                        className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                    >
                        Ver todos os produtos
                    </Button>
                </div>
                <StoreFooter />
            </div>
        );
    }

    const hasPromo = !!product.promo_price && product.promo_price < product.price;
    const finalPrice = hasPromo ? product.promo_price! : product.price;
    const outOfStock = product.stock === 0;

    return (
        <div className="min-h-screen bg-mc-sand-50 flex flex-col">
            <AnnouncementBar />
            <StoreHeader />

            <main className="flex-1">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5 sm:mb-8"
                    >
                        <ArrowLeft size={15} /> Voltar
                    </button>

                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
                        {/* imagem */}
                        <div className="relative facet-cut overflow-hidden bg-mc-blush-100 aspect-square">
                            {product.banner ? (
                                <img
                                    src={product.banner}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                    💎
                                </div>
                            )}
                            {hasPromo && (
                                <span className="absolute top-4 left-4 bg-mc-violet-950 text-mc-sand-50 text-xs font-bold px-2.5 py-1 rounded-full">
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
                                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-mc-gold-600">
                                    {product.category.name}
                                </span>
                            )}

                            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-mc-violet-950 mt-2 mb-3">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-0.5 mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        className="fill-mc-gold-500 text-mc-gold-500"
                                    />
                                ))}
                                <span className="text-xs text-mc-ink/50 ml-1.5">
                                    Avaliado por nossa comunidade
                                </span>
                            </div>

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

                            <p className="text-sm text-mc-ink/70 leading-relaxed mb-8">
                                {product.description}
                            </p>

                            {!outOfStock && (
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-sm text-mc-ink/60">Quantidade</span>
                                    <div className="flex items-center border border-mc-violet-950/15 rounded-full">
                                        <button
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            className="w-9 h-9 flex items-center justify-center text-mc-violet-950 hover:bg-mc-blush-100 rounded-full"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setQuantity((q) => Math.min(product.stock, q + 1))
                                            }
                                            className="w-9 h-9 flex items-center justify-center text-mc-violet-950 hover:bg-mc-blush-100 rounded-full"
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
                                className="w-full sm:w-auto facet-cut-sm bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-none px-8 py-6 text-sm font-medium disabled:opacity-40"
                            >
                                <ShoppingBag size={16} className="mr-2" />
                                {outOfStock
                                    ? "Indisponível"
                                    : adding
                                    ? "Adicionando..."
                                    : "Adicionar ao carrinho"}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <StoreFooter />
        </div>
    );
}
