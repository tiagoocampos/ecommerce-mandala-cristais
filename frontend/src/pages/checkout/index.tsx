import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin,
    ShoppingBag,
    Loader2,
    ArrowLeft,
    CreditCard,
    AlertCircle,
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

export function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, loading: cartLoading } = useCart();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        async function fetchAddresses() {
            setAddressesLoading(true);
            setError(null);
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
                setError("Não foi possível carregar seus endereços.");
            } finally {
                if (mounted) setAddressesLoading(false);
            }
        }
        fetchAddresses();
        return () => {
            mounted = false;
        };
    }, []);

    const items = cart?.items ?? [];
    const subtotal = items.reduce((sum, item) => {
        const price =
            item.product.promo_price && item.product.promo_price < item.product.price
                ? item.product.promo_price
                : item.product.price;
        return sum + price * item.quantity;
    }, 0);

    const isReady = items.length > 0 && !!selectedAddressId && !submitting;

    async function handleCheckout() {
        if (!selectedAddressId) return;

        setSubmitting(true);
        setError(null);

        try {
            // 1. Criar o pedido
            const { data: orderData } = await api.post<{ id: string }>("/order", {
                address_id: selectedAddressId,
            });

            const orderId = orderData.id;

            // 2. Redirecionar para a tela de pagamento
            navigate(`/payment/${orderId}`);
        } catch (err) {
            const msg = getApiErrorMessage(err, "");
            if (msg === "Carrinho vazio") {
                setError("Seu carrinho está vazio.");
            } else if (msg === "Estoque insuficiente" || msg.includes("estoque")) {
                setError(
                    "Estoque insuficiente para algum item. Volte ao carrinho e reduza a quantidade."
                );
            } else {
                setError(
                    msg ||
                        "Erro ao processar seu pedido. Tente novamente."
                );
            }
            showApiError(err, "Erro ao finalizar compra");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />

                <main className="flex-1">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                        <button
                            onClick={() => navigate("/carrinho")}
                            className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5"
                        >
                            <ArrowLeft size={15} /> Voltar ao carrinho
                        </button>

                        <h1 className="font-display text-2xl sm:text-3xl text-mc-violet-950 mb-8">
                            Finalizar <span className="italic text-mc-gold-600">compra</span>
                        </h1>

                        {error && (
                            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        )}

                        {cartLoading ? (
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
                                {/* COLUNA ESQUERDA: Endereço */}
                                <div className="space-y-6">
                                    {/* Seção de endereço */}
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
                                                    const isSelected =
                                                        selectedAddressId === addr.id;
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

                                    {/* Seção de pagamento (informativa) */}
                                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                                        <h2 className="font-display text-lg text-mc-violet-950 mb-4 flex items-center gap-2">
                                            <CreditCard size={18} className="text-mc-gold-600" />
                                            Pagamento
                                        </h2>
                                        <p className="text-sm text-mc-ink/60">
                                            Após confirmar o pedido, você será redirecionado para
                                            o Mercado Pago para realizar o pagamento de forma
                                            segura.
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="text-xs bg-mc-sand-100 text-mc-ink/70 px-2.5 py-1 rounded-full">
                                                Pix
                                            </span>
                                            <span className="text-xs bg-mc-sand-100 text-mc-ink/70 px-2.5 py-1 rounded-full">
                                                Cartão
                                            </span>
                                            <span className="text-xs bg-mc-sand-100 text-mc-ink/70 px-2.5 py-1 rounded-full">
                                                Boleto
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* COLUNA DIREITA: Resumo do pedido */}
                                <div className="space-y-4 sm:sticky sm:top-24">
                                    <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5">
                                        <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                                            Resumo do pedido
                                        </h2>

                                        {/* Itens do resumo */}
                                        <div className="space-y-3 mb-4">
                                            {items.map((item) => {
                                                const hasPromo =
                                                    !!item.product.promo_price &&
                                                    item.product.promo_price < item.product.price;
                                                const unitPrice = hasPromo
                                                    ? item.product.promo_price!
                                                    : item.product.price;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className="flex gap-3 items-center"
                                                    >
                                                        <div className="w-12 h-12 rounded-md overflow-hidden bg-white shrink-0">
                                                            {item.product.banner ? (
                                                                <img
                                                                    src={item.product.banner}
                                                                    alt={item.product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-lg">
                                                                    💎
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-mc-violet-950 line-clamp-1">
                                                                {item.product.name}
                                                            </p>
                                                            <p className="text-xs text-mc-ink/60">
                                                                Qtd: {item.quantity}
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-medium text-mc-violet-950 whitespace-nowrap">
                                                            {formatPrice(unitPrice * item.quantity)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="border-t border-mc-violet-950/10 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm text-mc-ink/70">
                                                <span>Subtotal</span>
                                                <span>{formatPrice(subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-mc-ink/70">
                                                <span>Frete</span>
                                                <span className="text-xs">Calculado na entrega</span>
                                            </div>
                                            <div className="border-t border-mc-violet-950/10 pt-2 flex justify-between font-semibold text-mc-violet-950">
                                                <span>Total</span>
                                                <span className="text-lg">
                                                    {formatPrice(subtotal)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        disabled={!isReady}
                                        onClick={handleCheckout}
                                        className="w-full bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full h-11 disabled:bg-mc-violet-950/30 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" />
                                                Processando...
                                            </span>
                                        ) : !selectedAddressId ? (
                                            "Selecione um endereço"
                                        ) : (
                                            "Finalizar compra"
                                        )}
                                    </Button>

                                    <p className="text-[11px] text-mc-ink/50 text-center">
                                        Ao finalizar, você será redirecionado para o Mercado Pago
                                        para pagamento seguro.
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

