import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    MapPin,
    ShoppingBag,
    Loader2,
    ArrowLeft,
    CreditCard,
    AlertCircle,
    Tag,
    X,
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
import { ProductImage } from "../../components/store/ProductImage";
import { Input } from "../../components/ui/input";
import type { CouponType } from "../../types/admin";
import { ShippingOptions, type ShippingOption } from "../../components/store/ShippingOptions";

interface AppliedCoupon {
    code: string;
    type: CouponType;
    value: number;
}

// Mesma conta do backend (validateCoupon), só para exibir; o valor real é recalculado ao criar o pedido.
function previewDiscount(coupon: AppliedCoupon, subtotal: number): number {
    const raw = coupon.type === "PERCENTAGE" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    return Math.max(0, Math.min(raw, subtotal));
}

export function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, loading: cartLoading, refreshCart } = useCart();

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [shippingService, setShippingService] = useState<string | null>(null);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [shippingError, setShippingError] = useState<string | null>(null);
    const [shippingRefresh, setShippingRefresh] = useState(0);
    const quoteRequestId = useRef(0);

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

    // Recota sempre que o endereço (CEP) ou o conteúdo do carrinho mudar
    const cartSignature = items.map((item) => `${item.product.id}:${item.quantity}`).join("|");
    useEffect(() => {
        setShippingOptions([]);
        setShippingService(null);
        setShippingError(null);
        if (!selectedAddressId || !cartSignature) return;

        const requestId = ++quoteRequestId.current;
        setShippingLoading(true);
        api.post<ShippingOption[]>("/shipping/quote", { address_id: selectedAddressId })
            .then(({ data }) => {
                if (requestId !== quoteRequestId.current) return; // resposta de um endereço antigo
                setShippingOptions(data);
                setShippingService(data[0]?.service ?? null); // mais barato já vem primeiro
            })
            .catch((err) => {
                if (requestId !== quoteRequestId.current) return;
                setShippingError(
                    getApiErrorMessage(err, "Não conseguimos calcular o frete agora, tente novamente em instantes.")
                );
            })
            .finally(() => {
                if (requestId === quoteRequestId.current) setShippingLoading(false);
            });
    }, [selectedAddressId, cartSignature, shippingRefresh]);

    const selectedShipping = shippingOptions.find((option) => option.service === shippingService) ?? null;
    const shippingCost = selectedShipping?.price_cents ?? 0;

    const discount = appliedCoupon ? previewDiscount(appliedCoupon, subtotal) : 0;
    const total = Math.max(0, subtotal - discount) + shippingCost;

    // Frete é obrigatório: sem opção escolhida não finaliza
    const isReady = items.length > 0 && !!selectedAddressId && !!selectedShipping && !submitting;

    async function handleApplyCoupon(e: React.FormEvent) {
        e.preventDefault();
        const code = couponInput.trim().toUpperCase();
        if (!code) return;

        setApplyingCoupon(true);
        setCouponError(null);
        try {
            const { data } = await api.post<AppliedCoupon & { valid: boolean }>("/coupons/validate", { code });
            setAppliedCoupon({ code: data.code, type: data.type, value: data.value });
            setCouponInput("");
        } catch (err) {
            setAppliedCoupon(null);
            setCouponError(getApiErrorMessage(err, "Não foi possível aplicar este cupom."));
        } finally {
            setApplyingCoupon(false);
        }
    }

    function handleRemoveCoupon() {
        setAppliedCoupon(null);
        setCouponError(null);
    }

    async function handleCheckout() {
        if (!selectedAddressId || !selectedShipping) return;

        setSubmitting(true);
        setError(null);

        try {
            // 1. Criar o pedido
            // Envia só códigos: o backend recota o frete e recalcula o desconto.
            // shipping_quote_cents só é usado se o Melhor Envio cair na hora de finalizar.
            const { data: orderData } = await api.post<{ id: string }>("/order", {
                address_id: selectedAddressId,
                shipping_service: selectedShipping.service,
                shipping_quote_cents: selectedShipping.price_cents,
                ...(appliedCoupon && { coupon_code: appliedCoupon.code }),
            });

            const orderId = orderData.id;

            // 2. O backend já esvaziou o carrinho ao criar o pedido: sincroniza antes de sair,
            //    para o carrinho e o "Finalizar compra" sumirem imediatamente
            await refreshCart();

            // 3. Redirecionar para a tela de pagamento
            navigate(`/payment/${orderId}`);
        } catch (err) {
            const msg = getApiErrorMessage(err, "");
            const lower = msg.toLowerCase();
            // carrinho/estoque divergente do servidor: ressincroniza
            if (lower.includes("carrinho") || lower.includes("estoque")) {
                await refreshCart();
            }
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
            // Frete mudou/saiu do ar desde a cotação: recota para o cliente escolher de novo
            if (axios.isAxiosError(err) && err.response?.status === 409) {
                setShippingRefresh((n) => n + 1);
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
                            Finalizar <span className="italic text-mc-gold-700">compra</span>
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
                                            <MapPin size={18} className="text-mc-gold-700" />
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
                                                                    ? "border-mc-gold-500 bg-mc-blush-100 ring-1 ring-mc-gold-500/40"
                                                                    : "border-mc-violet-950/10 bg-mc-sand-50 hover:bg-mc-blush-100"
                                                            }`}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <div
                                                                    className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                                                                        isSelected
                                                                            ? "border-mc-gold-500"
                                                                            : "border-mc-violet-950/30"
                                                                    }`}
                                                                >
                                                                    {isSelected && (
                                                                        <div className="w-2 h-2 rounded-full bg-mc-gold-500" />
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

                                    <ShippingOptions
                                        hasAddress={!!selectedAddressId}
                                        loading={shippingLoading}
                                        error={shippingError}
                                        options={shippingOptions}
                                        selected={shippingService}
                                        onSelect={setShippingService}
                                        onRetry={() => setShippingRefresh((n) => n + 1)}
                                    />

                                    {/* Seção de pagamento (informativa) */}
                                    <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5">
                                        <h2 className="font-display text-lg text-mc-violet-950 mb-4 flex items-center gap-2">
                                            <CreditCard size={18} className="text-mc-gold-700" />
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
                                                            <ProductImage src={item.product.banner} alt={item.product.name} iconSize={18} />
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

                                        {/* Cupom de desconto */}
                                        <div className="border-t border-mc-violet-950/10 pt-4 mb-4">
                                            {appliedCoupon ? (
                                                <div className="flex items-center justify-between gap-2 rounded-lg border border-mc-success-700/25 bg-mc-success-100 px-3 py-2">
                                                    <span className="flex items-center gap-2 text-sm text-mc-success-700">
                                                        <Tag size={14} />
                                                        Cupom <strong className="font-mono">{appliedCoupon.code}</strong> aplicado
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveCoupon}
                                                        aria-label="Remover cupom"
                                                        className="rounded-full p-1 text-mc-success-700 hover:bg-white/60"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <form onSubmit={handleApplyCoupon}>
                                                    <label htmlFor="coupon" className="text-sm text-mc-ink/70">
                                                        Cupom de desconto
                                                    </label>
                                                    <div className="mt-1.5 flex gap-2">
                                                        <Input
                                                            id="coupon"
                                                            value={couponInput}
                                                            onChange={(e) => {
                                                                setCouponInput(e.target.value.toUpperCase());
                                                                setCouponError(null);
                                                            }}
                                                            placeholder="Digite o cupom"
                                                            autoComplete="off"
                                                            aria-invalid={!!couponError}
                                                            aria-describedby={couponError ? "coupon-error" : undefined}
                                                            className="h-9 bg-white font-mono uppercase"
                                                        />
                                                        <Button
                                                            type="submit"
                                                            variant="outline"
                                                            disabled={applyingCoupon || !couponInput.trim()}
                                                            className="h-9 shrink-0 border-mc-violet-950/20 text-mc-violet-950 hover:bg-white"
                                                        >
                                                            {applyingCoupon ? <Loader2 size={14} className="animate-spin" /> : "Aplicar"}
                                                        </Button>
                                                    </div>
                                                    {couponError && (
                                                        <p id="coupon-error" className="mt-1.5 text-xs text-destructive">
                                                            {couponError}
                                                        </p>
                                                    )}
                                                </form>
                                            )}
                                        </div>

                                        <div className="border-t border-mc-violet-950/10 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm text-mc-ink/70">
                                                <span>Subtotal</span>
                                                <span>{formatPrice(subtotal)}</span>
                                            </div>
                                            {discount > 0 && (
                                                <div className="flex justify-between text-sm text-mc-success-700">
                                                    <span>Desconto ({appliedCoupon?.code})</span>
                                                    <span>-{formatPrice(discount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm text-mc-ink/70">
                                                <span>
                                                    Frete{selectedShipping ? ` (${selectedShipping.service})` : ""}
                                                </span>
                                                {selectedShipping ? (
                                                    <span>{formatPrice(selectedShipping.price_cents)}</span>
                                                ) : (
                                                    <span className="text-xs">
                                                        {shippingLoading ? "Calculando..." : "Escolha o frete"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="border-t border-mc-violet-950/10 pt-2 flex justify-between font-semibold text-mc-violet-950">
                                                <span>Total</span>
                                                <span className="text-lg">
                                                    {formatPrice(total)}
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
                                        ) : !selectedShipping ? (
                                            shippingLoading ? "Calculando frete..." : "Escolha uma opção de frete"
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

