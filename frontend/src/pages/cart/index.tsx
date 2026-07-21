import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    Trash2,
    Minus,
    Plus,
    ShoppingBag,
    ArrowLeft,
    MapPin,
    Loader2,
} from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { formatPrice, showApiError, getApiErrorMessage } from "../../lib/utils-api";
import { useCart } from "../../contexts/CartContext";
import { api } from "../../services/api";
import type { Address } from "../../types";

export function CartPage() {
    const navigate = useNavigate();
    const { cart, loading, updateItem, removeItem, refreshCart } = useCart();
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [checkingOut, setCheckingOut] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function fetchAddresses() {
            setAddressesLoading(true);
            try {
                const { data } = await api.get<Address[]>("/address");
                if (!mounted) return;
                setAddresses(data);
                if (data.length === 1) {
                    setSelectedAddressId(data[0].id);
                }
            } catch {
                if (!mounted) return;
                setAddresses([]);
            } finally {
                if (mounted) setAddressesLoading(false);
            }
        }
        fetchAddresses();
        return () => {
            mounted = false;
        };
    }, []);

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

    async function handleCheckout() {
        if (!selectedAddressId) return;
        setCheckingOut(true);
        try {
            const { data } = await api.post<{ id: string }>("/order", {
                address_id: selectedAddressId,
            });
            toast.success("Pedido realizado com sucesso!", {
                position: "top-center",
            });
            await refreshCart();
            navigate(`/pedido/${data.id}`, { replace: true });
        } catch (error: unknown) {
            const msg = getApiErrorMessage(error, "");
            if (msg === "Carrinho vazio") {
                toast.error("Seu carrinho está vazio.", { position: "top-center" });
            } else if (msg === "Endereço não encontrado") {
                toast.error("Endereço não encontrado. Selecione outro endereço.", {
                    position: "top-center",
                });
            } else if (
                msg.includes("Estoque insuficiente") ||
                msg.includes("estoque")
            ) {
                toast.error(
                    "Estoque insuficiente para algum item. Remova ou reduza a quantidade.",
                    { position: "top-center" }
                );
            } else {
                showApiError(error, "Erro ao finalizar compra");
            }
        } finally {
            setCheckingOut(false);
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

    const isCartReady = items.length > 0;

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
                            <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
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

                                {/* resumo + endereço */}
                                <div className="space-y-4 sm:sticky sm:top-24">
                                    {/* seleção de endereço */}
                                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                                        <h2 className="font-display text-lg text-mc-violet-950 mb-4 flex items-center gap-2">
                                            <MapPin size={18} className="text-mc-gold-600" />
                                            Endereço de entrega
                                        </h2>

                                        {addressesLoading ? (
                                            <div className="flex justify-center py-4">
                                                <Loading />
                                            </div>
                                        ) : addresses.length === 0 ? (
                                            <div className="text-center py-3 flex flex-col items-center gap-3">
                                                <p className="text-sm text-mc-ink/60">
                                                    Você precisa cadastrar um endereço antes de
                                                    finalizar a compra.
                                                </p>
                                                <Button
                                                    onClick={() => navigate("/profile")}
                                                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                                                >
                                                    Cadastrar endereço
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {addresses.map((addr) => {
                                                    const isSelected = selectedAddressId === addr.id;
                                                    return (
                                                        <button
                                                            key={addr.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedAddressId(addr.id)
                                                            }
                                                            className={`w-full text-left border rounded-lg p-3 transition-all ${
                                                                isSelected
                                                                    ? "border-mc-gold-600 bg-mc-blush-100 ring-1 ring-mc-gold-600/30"
                                                                    : "border-mc-violet-950/10 bg-mc-sand-50 hover:bg-mc-blush-100"
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <div
                                                                    className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                                                        isSelected
                                                                            ? "border-mc-gold-600"
                                                                            : "border-mc-violet-950/30"
                                                                    }`}
                                                                >
                                                                    {isSelected && (
                                                                        <div className="w-2 h-2 rounded-full bg-mc-gold-600" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <span className="text-sm font-medium text-mc-violet-950">
                                                                        {addr.street}, {addr.number}
                                                                    </span>
                                                                    <div className="text-xs text-mc-ink/60 mt-0.5">
                                                                        {addr.neighborhood} —{" "}
                                                                        {addr.city}, {addr.state}
                                                                    </div>
                                                                    {addr.complement && (
                                                                        <div className="text-xs text-mc-ink/50">
                                                                            {addr.complement}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* resumo financeiro */}
                                    <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5">
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
                                            disabled={
                                                !selectedAddressId ||
                                                addresses.length === 0 ||
                                                checkingOut ||
                                                !isCartReady
                                            }
                                            onClick={handleCheckout}
                                            className="w-full bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full disabled:bg-mc-violet-950/30 disabled:cursor-not-allowed"
                                        >
                                            {checkingOut ? (
                                                <span className="flex items-center gap-2">
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Finalizando...
                                                </span>
                                            ) : (
                                                "Finalizar compra"
                                            )}
                                        </Button>
                                    </div>
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
