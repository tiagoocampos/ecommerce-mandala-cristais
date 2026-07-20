import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { formatPrice, showApiError } from "../../lib/utils-api";
import { useCart } from "../../contexts/CartContext";

export function CartPage() {
    const navigate = useNavigate();
    const { cart, loading, updateItem, removeItem } = useCart();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    async function handleQuantityChange(item_id: string, quantity: number) {
        if (quantity < 1) return;
        setUpdatingId(item_id);
        try {
            await updateItem(item_id, quantity);
        } catch (error) {
            showApiError(error, "Erro ao atualizar quantidade");
        } finally {
            setUpdatingId(null);
        }
    }

    async function handleRemove(item_id: string) {
        setUpdatingId(item_id);
        try {
            await removeItem(item_id);
            toast.success("Item removido do carrinho");
        } catch (error) {
            showApiError(error, "Erro ao remover item");
        } finally {
            setUpdatingId(null);
        }
    }

    const items = cart?.items ?? [];
    const subtotal = items.reduce((sum, item) => {
        const price =
            item.product.promo_price && item.product.promo_price < item.product.price
                ? item.product.promo_price
                : item.product.price;
        return sum + price * item.quantity;
    }, 0);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />

                <main className="flex-1">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                        <button
                            onClick={() => navigate("/produtos")}
                            className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5"
                        >
                            <ArrowLeft size={15} /> Continuar comprando
                        </button>

                        <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-6">
                            Seu <span className="italic text-mc-gold-600">carrinho</span>
                        </h1>

                        {loading ? (
                            <div className="py-16 flex justify-center">
                                <Loading />
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-16 flex flex-col items-center gap-4">
                                <ShoppingBag size={40} className="text-mc-violet-950/20" />
                                <p className="text-sm text-mc-ink/60">
                                    Seu carrinho está vazio.
                                </p>
                                <Button
                                    onClick={() => navigate("/produtos")}
                                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                                >
                                    Explorar produtos
                                </Button>
                            </div>
                        ) : (
                            <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
                                {/* lista de itens */}
                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const hasPromo =
                                            !!item.product.promo_price &&
                                            item.product.promo_price < item.product.price;
                                        const unitPrice = hasPromo
                                            ? item.product.promo_price!
                                            : item.product.price;
                                        const isUpdating = updatingId === item.id;

                                        return (
                                            <div
                                                key={item.id}
                                                className="flex gap-3 sm:gap-4 bg-white border border-mc-violet-950/10 rounded-lg p-3 sm:p-4"
                                            >
                                                <button
                                                    onClick={() =>
                                                        navigate(`/produto/${item.product.slug}`)
                                                    }
                                                    className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden bg-mc-blush-100"
                                                >
                                                    {item.product.banner ? (
                                                        <img
                                                            src={item.product.banner}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl">
                                                            💎
                                                        </div>
                                                    )}
                                                </button>

                                                <div className="flex-1 min-w-0 flex flex-col">
                                                    <button
                                                        onClick={() =>
                                                            navigate(`/produto/${item.product.slug}`)
                                                        }
                                                        className="text-sm font-medium text-mc-violet-950 text-left line-clamp-2 hover:underline"
                                                    >
                                                        {item.product.name}
                                                    </button>

                                                    <span className="text-sm text-mc-ink/70 mt-1">
                                                        {formatPrice(unitPrice)}
                                                    </span>

                                                    <div className="mt-auto flex items-center justify-between pt-2">
                                                        <div className="flex items-center border border-mc-violet-950/15 rounded-full">
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.id,
                                                                        item.quantity - 1
                                                                    )
                                                                }
                                                                className="w-7 h-7 flex items-center justify-center text-mc-violet-950 hover:bg-mc-blush-100 rounded-full disabled:opacity-40"
                                                            >
                                                                <Minus size={12} />
                                                            </button>
                                                            <span className="w-6 text-center text-xs font-medium">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                disabled={isUpdating}
                                                                onClick={() =>
                                                                    handleQuantityChange(
                                                                        item.id,
                                                                        item.quantity + 1
                                                                    )
                                                                }
                                                                className="w-7 h-7 flex items-center justify-center text-mc-violet-950 hover:bg-mc-blush-100 rounded-full disabled:opacity-40"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                        </div>

                                                        <button
                                                            disabled={isUpdating}
                                                            onClick={() => handleRemove(item.id)}
                                                            className="text-red-600 hover:bg-red-50 p-1.5 rounded-full disabled:opacity-40"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* resumo */}
                                <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5 sm:sticky sm:top-24">
                                    <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                                        Resumo do pedido
                                    </h2>
                                    <div className="flex justify-between text-sm text-mc-ink/70 mb-2">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </div>
                                    <p className="text-xs text-mc-ink/50 mb-4">
                                        Frete calculado no checkout.
                                    </p>
                                    <div className="border-t border-mc-violet-950/10 pt-4 flex justify-between mb-5">
                                        <span className="text-sm font-medium text-mc-violet-950">
                                            Total
                                        </span>
                                        <span className="text-lg font-semibold text-mc-violet-950">
                                            {formatPrice(subtotal)}
                                        </span>
                                    </div>
                                    <Button
                                        disabled
                                        title="Finalização de compra em breve"
                                        className="w-full bg-mc-violet-950/40 text-mc-sand-50 rounded-full cursor-not-allowed"
                                    >
                                        Finalizar compra (em breve)
                                    </Button>
                                    <p className="text-[11px] text-mc-ink/40 text-center mt-2">
                                        O checkout com pagamento está sendo finalizado.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <StoreFooter />
            </div>
        </ProtectedRoute>
    );
}
