import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ShoppingBag,
    Loader2,
    ArrowLeft,
    CreditCard,
    AlertCircle,
    ExternalLink,
    Clock,
} from "lucide-react";
import { AnnouncementBar } from "../../components/store/AnnouncementBar";
import { StoreHeader } from "../../components/store/StoreHeader";
import { StoreFooter } from "../../components/store/StoreFooter";
import { Loading } from "../../components/Loading";
import { Button } from "../../components/ui/button";
import { ProtectedRoute } from "../../components/ProtectedRoute";
import { formatPrice, formatDate } from "../../lib/utils-api";
import { api } from "../../services/api";
import type { Order, OrderStatus } from "../../types";

const STATUS_LABELS: Record<OrderStatus, string> = {
    PENDING: "Aguardando pagamento",
    PAID: "Pago",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
};

export function PaymentPage() {
    const { order_id } = useParams<{ order_id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        let mounted = true;
        async function fetchOrder() {
            setLoading(true);
            setNotFound(false);
            try {
                const { data } = await api.get<Order>(`/order/${order_id}`);
                if (!mounted) return;
                setOrder(data);
            } catch {
                if (!mounted) return;
                setNotFound(true);
                setOrder(null);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        if (order_id) {
            fetchOrder();
        }
        return () => {
            mounted = false;
        };
        
    }, [order_id]);

    async function handlePayWithMercadoPago() {
         console.log("Cliquei");
        if (!order_id) return;

        setProcessing(true);
        setError(null);

        try {
            const { data } = await api.post<{
                checkout_url: string;
                order_id: string;
            }>("/payment/preference", {
                params: { order_id },
            });

            window.location.href = data.checkout_url;
        } catch (err) {
            setError(
                "Erro ao gerar link de pagamento. Tente novamente ou entre em contato conosco."
            );
        } finally {
            setProcessing(false);
        }
    }

    const isPending = order?.status === "PENDING";
    const isPaid = order?.status === "PAID";

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-mc-sand-50 flex flex-col">
                <AnnouncementBar />
                <StoreHeader />

                <main className="flex-1">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                        <button
                            onClick={() => navigate("/pedidos")}
                            className="flex items-center gap-1.5 text-sm text-mc-ink/60 hover:text-mc-violet-950 mb-5"
                        >
                            <ArrowLeft size={15} /> Voltar para meus pedidos
                        </button>

                        {loading ? (
                            <div className="py-16 flex justify-center">
                                <Loading />
                            </div>
                        ) : notFound || !order ? (
                            <div className="text-center py-14 flex flex-col items-center gap-4">
                                <ShoppingBag size={44} className="text-mc-violet-950/20" />
                                <h1 className="font-display text-2xl text-mc-violet-950">
                                    Pedido não encontrado
                                </h1>
                                <p className="text-sm text-mc-ink/60 max-w-sm">
                                    O pedido que você está procurando não existe ou não
                                    pertence à sua conta.
                                </p>
                                <Button
                                    onClick={() => navigate("/pedidos")}
                                    className="bg-mc-violet-950 hover:bg-mc-violet-800 text-mc-sand-50 rounded-full"
                                >
                                    Ver meus pedidos
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Cabeçalho do pedido */}
                                <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5 sm:p-6 mb-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                            <Clock size={20} className="text-mc-gold-600" />
                                        </div>
                                        <div>
                                            <h1 className="font-display text-xl text-mc-violet-950">
                                                Pedido #{order.id.slice(0, 8).toUpperCase()}
                                            </h1>
                                            <p className="text-xs text-mc-ink/60">
                                                {formatDate(order.createdAt)} —{" "}
                                                {STATUS_LABELS[order.status]}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Mensagem de erro */}
                                {error && (
                                    <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                                        <AlertCircle
                                            size={18}
                                            className="text-red-600 shrink-0 mt-0.5"
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-red-800">
                                                {error}
                                            </p>
                                            <button
                                                onClick={handlePayWithMercadoPago}
                                                className="text-sm text-red-700 underline hover:no-underline mt-1"
                                            >
                                                Tentar novamente
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Itens do pedido */}
                                <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5 sm:p-6 mb-6">
                                    <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                                        Itens do pedido
                                    </h2>
                                    <div className="space-y-3">
                                        {order.items.map((item) => {
                                            const unitPrice = item.unit_price;
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex gap-3 items-center"
                                                >
                                                    <div className="w-14 h-14 rounded-md overflow-hidden bg-mc-blush-100 shrink-0">
                                                        {item.product.banner ? (
                                                            <img
                                                                src={item.product.banner}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xl">
                                                                💎
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-mc-violet-950 line-clamp-1">
                                                            {item.product.name}
                                                        </p>
                                                        <p className="text-xs text-mc-ink/60">
                                                            Qtd: {item.quantity} ×{" "}
                                                            {formatPrice(unitPrice)}
                                                        </p>
                                                    </div>
                                                    <span className="text-sm font-medium text-mc-violet-950 whitespace-nowrap">
                                                        {formatPrice(unitPrice * item.quantity)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Resumo financeiro */}
                                <div className="bg-mc-blush-100 border border-mc-violet-950/10 rounded-lg p-5 sm:p-6 mb-6">
                                    <h2 className="font-display text-lg text-mc-violet-950 mb-4">
                                        Resumo financeiro
                                    </h2>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-mc-ink/70">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(order.subtotal)}</span>
                                        </div>
                                        {order.discount > 0 && (
                                            <div className="flex justify-between text-emerald-700">
                                                <span>Desconto</span>
                                                <span>-{formatPrice(order.discount)}</span>
                                            </div>
                                        )}
                                        {order.shipping_cost > 0 && (
                                            <div className="flex justify-between text-mc-ink/70">
                                                <span>Frete</span>
                                                <span>{formatPrice(order.shipping_cost)}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-mc-violet-950/10 pt-2 flex justify-between font-semibold text-mc-violet-950">
                                            <span>Total</span>
                                            <span className="text-lg">
                                                {formatPrice(order.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bloco de pagamento */}
                                <div className="bg-white border border-mc-violet-950/10 rounded-lg p-5 sm:p-6 mb-6">
                                    <h2 className="font-display text-lg text-mc-violet-950 mb-4 flex items-center gap-2">
                                        <CreditCard size={18} className="text-mc-gold-600" />
                                        Pagamento
                                    </h2>

                                    {isPaid ? (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                                            <p className="text-sm font-medium text-emerald-800">
                                                ✅ Pagamento confirmado!
                                            </p>
                                            <p className="text-xs text-emerald-700 mt-1">
                                                Seu pedido já está sendo processado.
                                            </p>
                                        </div>
                                    ) : isPending ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-mc-ink/60">
                                                Seu pedido foi criado com sucesso! Agora
                                                escolha a forma de pagamento para concluir
                                                a compra.
                                            </p>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-mc-sand-100 text-mc-ink/70 px-2.5 py-1 rounded-full">
                                                    Pix
                                                </span>
                                                <span className="text-xs bg-mc-sand-100 text-mc-ink/70 px-2.5 py-1 rounded-full">
                                                    Cartão de crédito
                                                </span>
                                                <span className="text-xs bg-mc-sand-100 text-mc-ink/70 px-2.5 py-1 rounded-full">
                                                    Boleto
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={handlePayWithMercadoPago}
                                                disabled={processing}
                                                className="w-full bg-mc-gold-500 hover:bg-mc-gold-600 text-mc-violet-950 rounded-full h-11 font-semibold disabled:bg-mc-gold-500/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 size={16} className="animate-spin" />
                                                        Gerando link de pagamento...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ExternalLink size={16} />
                                                        Pagar com Mercado Pago
                                                    </>
                                                )}          

                                            </button>

                                            <p className="text-[11px] text-mc-ink/50 text-center">
                                                Você será redirecionado para o ambiente
                                                seguro do Mercado Pago para realizar o
                                                pagamento.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-mc-sand-100 border border-mc-violet-950/10 rounded-lg p-4">
                                            <p className="text-sm text-mc-ink/60 text-center">
                                                Status:{" "}
                                                <strong>
                                                    {STATUS_LABELS[order.status]}
                                                </strong>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Ações */}
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Button
                                        onClick={() => navigate("/pedidos")}
                                        variant="ghost"
                                        className="text-mc-violet-950 hover:bg-mc-blush-100 rounded-full"
                                    >
                                        Ver todos os meus pedidos
                                    </Button>
                                    <Button
                                        onClick={() => navigate("/")}
                                        variant="ghost"
                                        className="text-mc-violet-950 hover:bg-mc-blush-100 rounded-full"
                                    >
                                        Continuar comprando
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </main>

                <StoreFooter />
            </div>
        </ProtectedRoute>
    );
}

